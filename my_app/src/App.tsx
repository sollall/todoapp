import './styles.css'
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import React, { useState } from "react";
import TaskDetailPanel from './TaskDetailPanel';

// 改良されたTaskInfoデータベースをインポート
import { TaskInfoDatabaseManager, createTaskInfoDatabase, generateTaskId } from './TaskInfoDatabase';

// 型定義
interface Stats {
  totalTasks: number;
  completedTasks: number;
}

interface TaskDetails {
  tags: string[];
  priority: string;
  dueDate: string;
  notes: string;
  assignee: string;
  estimatedTime: string;
  status: string;
}

interface TaskInfo {
  id: string;
  text: string;
  completed: boolean;
  level: number;
  parentId: string | null;
  details: TaskDetails; // 必須に変更
}

export default function App() {
  const [stats, setStats] = useState<Stats>({
    totalTasks: 0,
    completedTasks: 0
  });
  
  // 右側画面の状態管理
  const [rightPanelContent, setRightPanelContent] = useState<string>('default');
  const [selectedTaskInfo, setSelectedTaskInfo] = useState<TaskInfo | null>(null);
  const [taskList, setTaskList] = useState<TaskInfo[]>([]);
  
  // デバッグログの状態管理
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  
  // 🔥 改良版：TaskInfoDatabaseManager を使用
  const [taskDatabase] = useState(() => new TaskInfoDatabaseManager(createTaskInfoDatabase()));
  
  // ログ追加関数
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    setDebugLogs(prev => [logMessage, ...prev].slice(0, 15)); // 最新15件に増加
    console.log(logMessage); // コンソールにも出力
  };

  // 🚀 改良されたタスククリックハンドラー
  const handleTaskSelection = (taskText: string) => {
    addLog(`🎯 タスク選択: ${taskText}`);
    
    // TaskInfoDatabaseからTaskInfoを取得
    const taskInfo = taskDatabase.getTaskByName(taskText);
    
    if (taskInfo) {
      addLog(`✅ TaskInfoを取得: ${taskInfo.text} (ID: ${taskInfo.id})`);
      addLog(`📋 優先度: ${taskInfo.details.priority}, ステータス: ${taskInfo.details.status}`);
      addLog(`👤 担当者: ${taskInfo.details.assignee}`);
      addLog(`🏷️ タグ: ${taskInfo.details.tags.join(', ')}`);
      
      // そのまま設定（既にTaskInfo形式）
      setSelectedTaskInfo(taskInfo);
      setRightPanelContent('task-detail');
      addLog(`📋 タスク詳細設定完了: ${taskInfo.text}`);
    } else {
      addLog(`❌ タスクが見つかりません: ${taskText}`);
      
      // 新しいTaskInfoを作成
      const newTaskInfo: TaskInfo = {
        id: generateTaskId(),
        text: taskText,
        completed: false,
        level: 0,
        parentId: null,
        details: {
          tags: ['新規作成', 'エディター'],
          priority: '中',
          dueDate: '',
          notes: 'エディターから新しく作成されたタスクです。詳細情報を編集してください。',
          assignee: '未割り当て',
          estimatedTime: '未定',
          status: '未着手'
        }
      };
      
      // データベースに追加
      taskDatabase.addTask(newTaskInfo);
      setSelectedTaskInfo(newTaskInfo);
      setRightPanelContent('task-detail');
      addLog(`🆕 新しいTaskInfoを作成: ${newTaskInfo.text} (ID: ${newTaskInfo.id})`);
    }
  };

  // タスク更新ハンドラー（改良版）
  const handleTaskUpdate = (updatedTaskInfo: TaskInfo) => {
    addLog(`🔄 タスク更新: ${updatedTaskInfo.text}`);
    
    // selectedTaskInfoを更新
    setSelectedTaskInfo(updatedTaskInfo);
    
    // データベースを更新
    taskDatabase.updateTask(updatedTaskInfo.text, updatedTaskInfo);
    
    addLog(`💾 TaskInfoデータベース更新完了: ${updatedTaskInfo.text}`);
    addLog(`📋 新しい優先度: ${updatedTaskInfo.details.priority}`);
    addLog(`📋 新しいステータス: ${updatedTaskInfo.details.status}`);
    addLog(`📋 新しい担当者: ${updatedTaskInfo.details.assignee}`);
    
    // 統計情報をログに表示
    const stats = taskDatabase.getStatistics();
    addLog(`📊 データベース統計: 総数${stats.total}, 完了${stats.completed}`);
  };

  // 🔥 修正版：直接ハンドラーを使用してクリックハンドラーを管理
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: false,
        orderedList: false,
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
    ],
    content: `
        <ul data-type="taskList">
          <li data-type="taskItem" data-checked="false">親タスク1
            <ul data-type="taskList">
              <li data-type="taskItem" data-checked="false">子タスク1-1</li>
              <li data-type="taskItem" data-checked="false">子タスク1-2</li>
            </ul>
          </li>
          <li data-type="taskItem" data-checked="false">親タスク2
            <ul data-type="taskList">
              <li data-type="taskItem" data-checked="true">子タスク2-1</li>
              <li data-type="taskItem" data-checked="false">子タスク2-2</li>
              <li data-type="taskItem" data-checked="false">子タスク2-3</li>
            </ul>
          </li>
          <li data-type="taskItem" data-checked="false">通常のタスク</li>
        </ul>
    `,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const doc = new DOMParser().parseFromString(html, 'text/html');
      
      // タスクリストを抽出
      const extractTasks = (element: Element, level: number = 0, parentId: string = ''): TaskInfo[] => {
        const tasks: TaskInfo[] = [];
        const taskItems = element.querySelectorAll(':scope > li[data-type="taskItem"]');
        
        taskItems.forEach((item, index) => {
          const isCompleted = item.getAttribute('data-checked') === 'true';
          const textContent = Array.from(item.childNodes)
            .filter(node => node.nodeType === Node.TEXT_NODE || 
                           (node.nodeType === Node.ELEMENT_NODE && !(node as Element).matches('ul')))
            .map(node => node.textContent)
            .join('')
            .trim();
          
          if (textContent) {
            // データベースから既存のTaskInfoを取得、なければ新規作成
            let existingTask = taskDatabase.getTaskByName(textContent);
            
            if (!existingTask) {
              // 新しいタスクを作成してデータベースに追加
              existingTask = {
                id: generateTaskId(),
                text: textContent,
                completed: isCompleted,
                level: level,
                parentId: parentId || null,
                details: {
                  tags: level > 0 ? ['サブタスク'] : ['親タスク'],
                  priority: '中',
                  dueDate: '',
                  notes: 'エディターで作成されたタスクです。',
                  assignee: '未割り当て',
                  estimatedTime: '未定',
                  status: isCompleted ? '完了' : '未着手'
                }
              };
              taskDatabase.addTask(existingTask);
              addLog(`🆕 新しいタスクをデータベースに追加: ${textContent}`);
            } else {
              // 既存のタスクの完了状態を更新
              if (existingTask.completed !== isCompleted) {
                existingTask.completed = isCompleted;
                existingTask.details.status = isCompleted ? '完了' : '未着手';
                taskDatabase.updateTask(textContent, existingTask);
                addLog(`🔄 タスク完了状態更新: ${textContent} -> ${isCompleted ? '完了' : '未完了'}`);
              }
            }
            
            tasks.push(existingTask);
            
            const childList = item.querySelector('ul[data-type="taskList"]');
            if (childList) {
              tasks.push(...extractTasks(childList, level + 1, existingTask.id));
            }
          }
        });
        
        return tasks;
      };
      
      const taskLists = doc.querySelectorAll('ul[data-type="taskList"]');
      if (taskLists.length > 0) {
        const extractedTasks = extractTasks(taskLists[0]);
        setTaskList(extractedTasks);
        addLog(`📝 タスクリスト更新: ${extractedTasks.length}件のタスク`);
      }
      
      // 親タスクの自動完了処理
      const parentTasks = doc.querySelectorAll('li[data-type="taskItem"]');
      let hasChanges = false;
      
      parentTasks.forEach(parentTask => {
        const childTaskList = parentTask.querySelector('ul[data-type="taskList"]');
        
        if (childTaskList) {
          const childTasks = childTaskList.querySelectorAll(':scope > li[data-type="taskItem"]');
          
          if (childTasks.length > 0) {
            const allChildrenCompleted = Array.from(childTasks).every(child => 
              child.getAttribute('data-checked') === 'true'
            );
            
            const parentChecked = parentTask.getAttribute('data-checked') === 'true';
            
            if (allChildrenCompleted && !parentChecked) {
              parentTask.setAttribute('data-checked', 'true');
              hasChanges = true;
            }
            else if (!allChildrenCompleted && parentChecked) {
              parentTask.setAttribute('data-checked', 'false');
              hasChanges = true;
            }
          }
        }
      });
      
      if (hasChanges) {
        const updatedHtml = doc.body.innerHTML;
        editor.commands.setContent(updatedHtml, false);
        addLog('🔄 親タスクの自動完了処理を実行');
      }
      
      // 統計を更新
      const allTasks = doc.querySelectorAll('li[data-type="taskItem"]');
      const completedTasks = doc.querySelectorAll('li[data-type="taskItem"][data-checked="true"]');
      
      setStats({
        totalTasks: allTasks.length,
        completedTasks: completedTasks.length
      });
    },
    onCreate: ({ editor }) => {
      addLog('🚀 エディター作成完了');
      addLog(`📚 データベース初期化完了: ${taskDatabase.getAllTasks().length}件のタスク`);
      
      // closest()に頼らない確実な方法を実装
      setTimeout(() => {
        const editorElement = editor.view.dom as HTMLElement;
        
        // 全てのタスクアイテムを取得し、それぞれに直接イベントリスナーを設定
        const setupTaskItemListeners = () => {
          // 既存のリスナーをクリア
          editorElement.removeEventListener('click', globalClickHandler);
          
          const taskItems = editorElement.querySelectorAll('li[data-type="taskItem"]');
          addLog(`🎯 発見されたタスクアイテム: ${taskItems.length}個`);
          
          taskItems.forEach((taskItem, index) => {
            const element = taskItem as HTMLElement;
            
            // 各タスクアイテムの詳細をログ
            const taskText = Array.from(element.childNodes)
              .filter(node => node.nodeType === Node.TEXT_NODE || 
                             (node.nodeType === Node.ELEMENT_NODE && !(node as Element).matches('ul')))
              .map(node => node.textContent)
              .join('')
              .trim();
            
            addLog(`  [${index}] "${taskText}" - 直接リスナー追加`);
            
            // 既存のリスナーを削除してから新しいリスナーを追加
            element.removeEventListener('click', directTaskHandler);
            element.addEventListener('click', directTaskHandler, true);
            
            // より確実にするため、子要素にもリスナーを追加
            const textNodes = element.querySelectorAll('*:not(ul):not(li)');
            textNodes.forEach(child => {
              (child as HTMLElement).removeEventListener('click', directTaskHandler);
              (child as HTMLElement).addEventListener('click', directTaskHandler, true);
            });
          });
          
          // さらに保険として、グローバルハンドラーも設定
          editorElement.addEventListener('click', globalClickHandler, true);
        };
        
        // 直接的なタスクハンドラー
        const directTaskHandler = (event: Event) => {
          event.preventDefault();
          event.stopPropagation();
          
          const target = event.target as HTMLElement;
          addLog('🎯 直接的なタスクハンドラー起動');
          
          // チェックボックスの場合はスキップ
          if (target.tagName.toLowerCase() === 'input') {
            addLog('❌ チェックボックス - スキップ');
            return;
          }
          
          // currentTargetまたはtargetからタスクアイテムを特定
          let taskElement = event.currentTarget as HTMLElement;
          
          // currentTargetがli[data-type="taskItem"]でない場合、親を探す
          if (taskElement.tagName !== 'LI' || taskElement.getAttribute('data-type') !== 'taskItem') {
            taskElement = target.closest('li[data-type="taskItem"]') as HTMLElement;
          }
          
          if (!taskElement) {
            // 手動で親要素を探索
            let current = target;
            while (current && current !== editorElement) {
              if (current.tagName === 'LI' && current.getAttribute('data-type') === 'taskItem') {
                taskElement = current;
                break;
              }
              current = current.parentElement;
            }
          }
          
          if (taskElement) {
            const taskText = Array.from(taskElement.childNodes)
              .filter(node => node.nodeType === Node.TEXT_NODE || 
                             (node.nodeType === Node.ELEMENT_NODE && !(node as Element).matches('ul')))
              .map(node => node.textContent)
              .join('')
              .trim();
            
            if (taskText) {
              addLog(`✅ 直接ハンドラーで取得成功: "${taskText}"`);
              handleTaskSelection(taskText);
              return;
            }
          }
          
          addLog('⚠️ 直接ハンドラーで取得失敗');
        };
        
        // 全体的なクリックハンドラー（フォールバック）
        const globalClickHandler = (event: Event) => {
          const target = event.target as HTMLElement;
          
          addLog('🔍 グローバルハンドラー起動');
          addLog(`📍 ターゲット: ${target.tagName}.${target.className}`);
          
          // チェックボックスの場合はスキップ
          if (target.tagName.toLowerCase() === 'input') {
            addLog('❌ チェックボックス - スキップ');
            return;
          }
          
          // 方法1: 標準的なclosest()
          let taskItem = target.closest('li[data-type="taskItem"]') as HTMLElement;
          if (taskItem) {
            addLog('✅ closest()で発見');
          } else {
            addLog('❌ closest()で見つからず');
            
            // 方法2: 手動で親要素を探索
            let current = target;
            let depth = 0;
            while (current && current !== editorElement && depth < 15) {
              addLog(`  [${depth}] ${current.tagName} data-type="${current.getAttribute('data-type') || 'なし'}"`);
              
              if (current.tagName === 'LI' && current.getAttribute('data-type') === 'taskItem') {
                taskItem = current;
                addLog(`✅ 手動探索で発見 (深度${depth})`);
                break;
              }
              current = current.parentElement;
              depth++;
            }
          }
          
          // 方法3: データベースから既知のタスク名を取得して推測
          if (!taskItem && target.textContent) {
            const allTaskNames = taskDatabase.getAllTasks().map(task => task.text);
            const clickedText = target.textContent.trim();
            
            for (const taskName of allTaskNames) {
              if (clickedText.includes(taskName) || taskName.includes(clickedText)) {
                addLog(`✅ データベース推測で発見: "${taskName}"`);
                handleTaskSelection(taskName);
                return;
              }
            }
          }
          
          if (taskItem) {
            const taskText = Array.from(taskItem.childNodes)
              .filter(node => node.nodeType === Node.TEXT_NODE || 
                             (node.nodeType === Node.ELEMENT_NODE && !(node as Element).matches('ul')))
              .map(node => node.textContent)
              .join('')
              .trim();
            
            if (taskText) {
              addLog(`✅ グローバルハンドラーで取得成功: "${taskText}"`);
              handleTaskSelection(taskText);
            } else {
              addLog('⚠️ テキスト抽出失敗');
            }
          } else {
            addLog('❌ 全ての方法で失敗');
            
            // 最後の手段: エディター内の全てのタスクアイテムから最も近いものを探す
            const allTaskItems = editorElement.querySelectorAll('li[data-type="taskItem"]');
            if (allTaskItems.length > 0) {
              const targetRect = target.getBoundingClientRect();
              let closestTask = null;
              let minDistance = Infinity;
              
              allTaskItems.forEach((item) => {
                const itemRect = item.getBoundingClientRect();
                const distance = Math.sqrt(
                  Math.pow(targetRect.left - itemRect.left, 2) + 
                  Math.pow(targetRect.top - itemRect.top, 2)
                );
                
                if (distance < minDistance) {
                  minDistance = distance;
                  closestTask = item;
                }
              });
              
              if (closestTask && minDistance < 100) { // 100px以内なら有効とみなす
                const taskText = Array.from(closestTask.childNodes)
                  .filter(node => node.nodeType === Node.TEXT_NODE || 
                                 (node.nodeType === Node.ELEMENT_NODE && !(node as Element).matches('ul')))
                  .map(node => node.textContent)
                  .join('')
                  .trim();
                
                if (taskText) {
                  addLog(`✅ 距離ベースで発見: "${taskText}" (距離: ${minDistance.toFixed(2)}px)`);
                  handleTaskSelection(taskText);
                }
              }
            }
          }
        };
        
        // 初期設定
        setupTaskItemListeners();
        
        // エディター更新時にリスナーを再設定
        const observer = new MutationObserver(() => {
          setTimeout(() => {
            addLog('🔄 DOM変更検出 - リスナー再設定');
            setupTaskItemListeners();
          }, 50);
        });
        
        observer.observe(editorElement, {
          childList: true,
          subtree: true,
          attributes: true
        });
        
        addLog('👂 全てのイベントリスナー設定完了');
      }, 300); // 300ms遅延で確実にDOM準備完了を待つ
    }
  });

  // テスト用ボタンハンドラー（改良版）
  const handleTestClick = (contentType: string): void => {
    addLog(`🧪 テストボタンクリック: ${contentType}`);
    setRightPanelContent(contentType);
    
    if (contentType === 'task-detail') {
      // データベースから実際のタスクを取得
      const testTask = taskDatabase.getTaskByName('親タスク1');
      if (testTask) {
        setSelectedTaskInfo(testTask);
        addLog(`✅ テストタスク詳細を設定: ${testTask.text} (ID: ${testTask.id})`);
      } else {
        // フォールバック: 新しいテストタスクを作成
        const newTestTask: TaskInfo = {
          id: generateTaskId(),
          text: 'テストタスク',
          completed: false,
          level: 0,
          parentId: null,
          details: {
            tags: ['テスト', 'サンプル'],
            priority: '高',
            dueDate: '2025-07-01',
            notes: 'これはテスト用のタスクです。',
            assignee: '田中太郎',
            estimatedTime: '4時間',
            status: '進行中'
          }
        };
        taskDatabase.addTask(newTestTask);
        setSelectedTaskInfo(newTestTask);
        addLog(`🆕 新しいテストタスクを作成: ${newTestTask.text} (ID: ${newTestTask.id})`);
      }
    }
  };

  // リセットハンドラー
  const handleReset = (): void => {
    setRightPanelContent('default');
    setSelectedTaskInfo(null);
    addLog('🔄 パネルをリセット');
  };

  // ログクリアハンドラー
  const handleClearLogs = (): void => {
    setDebugLogs([]);
    addLog('🗑️ ログをクリア');
  };

  // データベース統計表示用
  const handleShowStats = (): void => {
    const stats = taskDatabase.getStatistics();
    addLog('📊 === データベース統計 ===');
    addLog(`📝 総タスク数: ${stats.total}`);
    addLog(`✅ 完了タスク数: ${stats.completed}`);
    addLog(`🔥 高優先度: ${stats.byPriority.高}件`);
    addLog(`⚡ 中優先度: ${stats.byPriority.中}件`);
    addLog(`📋 低優先度: ${stats.byPriority.低}件`);
    addLog(`👥 担当者別: ${Object.entries(stats.byAssignee).map(([name, count]) => `${name}(${count})`).join(', ')}`);
  };

  return (
    <div style={{ 
      display: 'flex', 
      height: '100vh', 
      width: '100vw',
      backgroundColor: '#f9fafb',
      margin: 0,
      padding: 0
    }}>
      {/* 左側 */}
      <div style={{ 
        flex: 1,
        padding: '24px', 
        overflow: 'auto',
        minWidth: 0
      }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
          📝 親子タスク連動エディタ（TaskInfoDB版）
        </h1>
        
        {/* 統計表示 */}
        <div style={{ 
          marginBottom: '16px', 
          padding: '12px', 
          backgroundColor: '#dbeafe', 
          borderRadius: '8px' 
        }}>
          <p style={{ fontWeight: '600' }}>📊 タスク統計</p>
          <p>完了: {stats.completedTasks}/{stats.totalTasks}</p>
          <p>データベース: {taskDatabase.getAllTasks().length}件のタスク</p>
          <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '8px' }}>
            💡 子タスクをすべて完了すると親タスクも自動で完了します
          </p>
          <button 
            onClick={handleShowStats}
            style={{
              marginTop: '8px',
              padding: '4px 8px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            📊 詳細統計をログに表示
          </button>
        </div>
        
        <div style={{ 
          border: '1px solid #d1d5db', 
          borderRadius: '6px', 
          padding: '16px',
          backgroundColor: 'white',
          minHeight: '400px'
        }}>
          <EditorContent
            editor={editor}
            className="prose w-full h-full outline-none checked-task"
            style={{ cursor: 'pointer' }}
          />
        </div>
        
        {/* 使い方説明 */}
        <div style={{ 
          marginTop: '16px', 
          padding: '12px', 
          backgroundColor: '#dcfce7', 
          borderRadius: '8px',
          fontSize: '14px'
        }}>
          <p style={{ fontWeight: '600', marginBottom: '8px' }}>🎯 動作確認方法:</p>
          <ol style={{ paddingLeft: '20px', lineHeight: '1.5' }}>
            <li>親タスク1の子タスク1-1と1-2を両方完了してみてください</li>
            <li>親タスク1が自動で完了状態になります</li>
            <li>完了した子タスクのチェックを外すと親タスクも未完了に戻ります</li>
            <li>Tabキーで子タスクを作成できます</li>
            <li>🆕 タスクの文字部分をクリックすると右側に詳細が表示されます</li>
            <li>🔥 TaskInfoDatabaseで統一されたデータ管理</li>
          </ol>
        </div>

        {/* 改善点の表示 */}
        <div style={{ 
          marginTop: '16px', 
          padding: '12px', 
          backgroundColor: '#f0f9ff', 
          borderRadius: '8px',
          fontSize: '14px'
        }}>
          <p style={{ fontWeight: '600', marginBottom: '8px', color: '#0369a1' }}>🚀 TaskInfoDB版の改善点:</p>
          <ul style={{ paddingLeft: '20px', lineHeight: '1.5', color: '#0369a1' }}>
            <li>TaskDetailsDBからTaskInfoDatabaseに変更</li>
            <li>統一されたTaskInfo形式でデータ管理</li>
            <li>ランダムID自動生成</li>
            <li>親子関係の正確な管理</li>
            <li>検索・統計機能の強化</li>
            <li>データベース操作の一元化</li>
          </ul>
        </div>

        {/* デバッグ情報とログ表示 */}
        <div style={{
          marginTop: '16px',
          padding: '8px',
          backgroundColor: '#fef3c7',
          borderRadius: '6px',
          fontSize: '12px'
        }}>
          <div style={{ marginBottom: '8px' }}>
            現在の右画面: {rightPanelContent} | 選択中タスク: {selectedTaskInfo?.text || '未選択'} | 
            エディタータスク数: {taskList.length} | DB総数: {taskDatabase.getAllTasks().length}
          </div>
          
          {/* ミニログ表示 */}
          <div style={{ fontSize: '11px', color: '#92400e' }}>
            <strong>最新ログ:</strong> {debugLogs[0] || 'なし'}
          </div>
        </div>
      </div>

      {/* 右側 - 編集可能なコンポーネントを使用 */}
      <TaskDetailPanel
        rightPanelContent={rightPanelContent}
        selectedTaskInfo={selectedTaskInfo}
        onReset={handleReset}
        onTestClick={handleTestClick}
        debugLogs={debugLogs}
        onClearLogs={handleClearLogs}
        onTaskUpdate={handleTaskUpdate}
      />
    </div>
  );
}