import './styles.css'
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import React, { useState } from "react";
import TaskDetailPanel from './TaskDetailPanel';

// 分離したクリックハンドラーをインポート
import { 
  useEditorClickHandler
} from './taskClickHandler';

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
  details?: TaskDetails;
}

interface TaskDetailsDB {
  [key: string]: TaskDetails;
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
  
  // ログ追加関数
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    setDebugLogs(prev => [logMessage, ...prev].slice(0, 10)); // 最新10件を保持
    console.log(logMessage); // コンソールにも出力
  };

  // タスクの詳細情報データベース
  const taskDetailsDB: TaskDetailsDB = {
    '親タスク1': {
      tags: ['重要', 'プロジェクトA', '緊急'],
      priority: '高',
      dueDate: '2025-01-31',
      notes: 'このタスクは最優先で対応が必要です。関連部署との調整も含めて進めてください。プロジェクト成功の鍵となります。',
      assignee: '田中太郎',
      estimatedTime: '4時間',
      status: '進行中'
    },
    '子タスク1-1': {
      tags: ['サブタスク', 'プロジェクトA', '調査'],
      priority: '中',
      dueDate: '2025-01-25',
      notes: '親タスクの一部として実施。詳細な市場調査が必要です。競合他社の分析も含めてください。',
      assignee: '佐藤花子',
      estimatedTime: '2時間',
      status: '未着手'
    },
    '子タスク1-2': {
      tags: ['サブタスク', 'プロジェクトA', '確認待ち'],
      priority: '中',
      dueDate: '2025-01-28',
      notes: '他チームからの承認を待っている状態です。法務部のレビューが完了次第開始予定。',
      assignee: '田中太郎',
      estimatedTime: '1時間',
      status: '待機中'
    },
    '親タスク2': {
      tags: ['通常', 'プロジェクトB'],
      priority: '低',
      dueDate: '2025-02-15',
      notes: '時間に余裕があるため、他のタスクの後に対応予定。品質重視で慎重に進めます。',
      assignee: '山田次郎',
      estimatedTime: '6時間',
      status: '計画中'
    },
    '子タスク2-1': {
      tags: ['完了済み', 'プロジェクトB', '成功'],
      priority: '中',
      dueDate: '2025-01-20',
      notes: '予定通り完了しました。品質も良好で、次のフェーズに移行できます。素晴らしい成果でした。',
      assignee: '佐藤花子',
      estimatedTime: '3時間',
      status: '完了'
    },
    '子タスク2-2': {
      tags: ['進行中', 'プロジェクトB', 'レビュー待ち'],
      priority: '中',
      dueDate: '2025-01-30',
      notes: '現在作業中。来週にはレビューに出せる予定です。コードレビューも並行して実施中。',
      assignee: '山田次郎',
      estimatedTime: '4時間',
      status: '進行中'
    },
    '子タスク2-3': {
      tags: ['未着手', 'プロジェクトB', '設計'],
      priority: '低',
      dueDate: '2025-02-05',
      notes: '他のタスクが完了してから着手予定。準備は整っています。詳細設計から開始します。',
      assignee: '田中太郎',
      estimatedTime: '2時間',
      status: '未着手'
    },
    '通常のタスク': {
      tags: ['個人タスク', '調査', '学習'],
      priority: '中',
      dueDate: '2025-01-27',
      notes: '新しい技術の調査タスク。週末に時間を取って進める予定。React最新機能の調査を行います。',
      assignee: '自分',
      estimatedTime: '5時間',
      status: '進行中'
    }
  };

  // カスタムタスククリックハンドラー - taskListとtaskDetailsDBを使用
  const handleTaskSelection = (taskText: string) => {
    addLog(`🎯 タスク選択: ${taskText}`);
    let details = null;

    // タスクリストから対応するタスクを検索
    details = taskDetailsDB[taskText];
    
    if (details) {
      addLog(`📋 完全一致で詳細情報を取得: ${details.tags}`);

    } else {
      addLog(`❌ マッチするタスクが見つかりません: ${taskText}`);
      addLog(`📝 現在のタスク数: ${taskList.length}`);
    }
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
            const taskId = parentId ? `${parentId}-${index}` : `${index}`;
            tasks.push({
              id: taskId,
              text: textContent,
              completed: isCompleted,
              level: level,
              parentId: parentId || null
            });
            
            const childList = item.querySelector('ul[data-type="taskList"]');
            if (childList) {
              tasks.push(...extractTasks(childList, level + 1, taskId));
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
          
          // 方法3: 既知のタスク名から推測
          if (!taskItem && target.textContent) {
            const knownTasks = ['親タスク1', '子タスク1-1', '子タスク1-2', '親タスク2', '子タスク2-1', '子タスク2-2', '子タスク2-3', '通常のタスク'];
            const clickedText = target.textContent.trim();
            
            for (const taskName of knownTasks) {
              if (clickedText.includes(taskName) || taskName.includes(clickedText)) {
                addLog(`✅ テキスト推測で発見: "${taskName}"`);
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

  // テスト用ボタンハンドラー
  const handleTestClick = (contentType: string): void => {
    addLog(`🧪 テストボタンクリック: ${contentType}`);
    setRightPanelContent(contentType);
    // テスト用のタスク情報を設定
    if (contentType === 'task-detail') {
      const testTaskInfo = {
        id: 'test-1',
        text: 'テストタスク',
        completed: false,
        level: 0,
        parentId: null,
        details: taskDetailsDB['親タスク1'] // テスト用に親タスク1の詳細を使用
      };
      setSelectedTaskInfo(testTaskInfo);
      addLog(`✅ テストタスク詳細を設定: ${testTaskInfo.text}`);
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
          📝 親子タスク連動エディタ（カスタムフック版）
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
          <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '8px' }}>
            💡 子タスクをすべて完了すると親タスクも自動で完了します
          </p>
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
            <li>🔥 カスタムフックでクリックハンドラーが管理されています</li>
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
          <p style={{ fontWeight: '600', marginBottom: '8px', color: '#0369a1' }}>🚀 実装改善点:</p>
          <ul style={{ paddingLeft: '20px', lineHeight: '1.5', color: '#0369a1' }}>
            <li>useEffectロジックをuseEditorClickHandlerに分離</li>
            <li>クリックハンドラーをtaskClickHandler.tsに分離</li>
            <li>メインコンポーネントが軽量化されました</li>
            <li>再利用可能なカスタムフックとして実装</li>
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
            タスク数: {taskList.length}
          </div>
          
          {/* ミニログ表示 */}
          <div style={{ fontSize: '11px', color: '#92400e' }}>
            <strong>最新ログ:</strong> {debugLogs[0] || 'なし'}
          </div>
        </div>
      </div>

      {/* 右側 - 分離したコンポーネントを使用 */}
      <TaskDetailPanel
        rightPanelContent={rightPanelContent}
        selectedTaskInfo={selectedTaskInfo}
        onReset={handleReset}
        onTestClick={handleTestClick}
        debugLogs={debugLogs}
        onClearLogs={handleClearLogs}
      />
    </div>
  );
}