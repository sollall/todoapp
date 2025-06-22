// TaskInfoデータベース改良版

// ランダムID生成関数
const generateTaskId = (): string => {
  const randomPart = Math.random().toString(36).substring(2, 10);
  return `task_${randomPart}`;
};

// 型定義
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
  details: TaskDetails; // detailsは必須に変更
}

// 新しいデータベース構造（TaskInfoの配列）
interface TaskInfoDatabase {
  [key: string]: TaskInfo; // キーはタスク名、値はTaskInfo
}

// 改良されたタスクデータベース
const createTaskInfoDatabase = (): TaskInfoDatabase => {
  const database: TaskInfoDatabase = {};

  // 親タスク1を作成
  const parentTask1: TaskInfo = {
    id: generateTaskId(),
    text: '親タスク1',
    completed: false,
    level: 0,
    parentId: null,
    details: {
      tags: ['重要', 'プロジェクトA', '緊急'],
      priority: '高',
      dueDate: '2025-01-31',
      notes: 'このタスクは最優先で対応が必要です。関連部署との調整も含めて進めてください。プロジェクト成功の鍵となります。',
      assignee: '田中太郎',
      estimatedTime: '4時間',
      status: '進行中'
    }
  };

  // 子タスク1-1を作成
  const childTask1_1: TaskInfo = {
    id: generateTaskId(),
    text: '子タスク1-1',
    completed: false,
    level: 1,
    parentId: parentTask1.id,
    details: {
      tags: ['サブタスク', 'プロジェクトA', '調査'],
      priority: '中',
      dueDate: '2025-01-25',
      notes: '親タスクの一部として実施。詳細な市場調査が必要です。競合他社の分析も含めてください。',
      assignee: '佐藤花子',
      estimatedTime: '2時間',
      status: '未着手'
    }
  };

  // 子タスク1-2を作成
  const childTask1_2: TaskInfo = {
    id: generateTaskId(),
    text: '子タスク1-2',
    completed: false,
    level: 1,
    parentId: parentTask1.id,
    details: {
      tags: ['サブタスク', 'プロジェクトA', '確認待ち'],
      priority: '中',
      dueDate: '2025-01-28',
      notes: '他チームからの承認を待っている状態です。法務部のレビューが完了次第開始予定。',
      assignee: '田中太郎',
      estimatedTime: '1時間',
      status: '待機中'
    }
  };

  // 親タスク2を作成
  const parentTask2: TaskInfo = {
    id: generateTaskId(),
    text: '親タスク2',
    completed: false,
    level: 0,
    parentId: null,
    details: {
      tags: ['通常', 'プロジェクトB'],
      priority: '低',
      dueDate: '2025-02-15',
      notes: '時間に余裕があるため、他のタスクの後に対応予定。品質重視で慎重に進めます。',
      assignee: '山田次郎',
      estimatedTime: '6時間',
      status: '計画中'
    }
  };

  // 子タスク2-1を作成
  const childTask2_1: TaskInfo = {
    id: generateTaskId(),
    text: '子タスク2-1',
    completed: true, // 完了済み
    level: 1,
    parentId: parentTask2.id,
    details: {
      tags: ['完了済み', 'プロジェクトB', '成功'],
      priority: '中',
      dueDate: '2025-01-20',
      notes: '予定通り完了しました。品質も良好で、次のフェーズに移行できます。素晴らしい成果でした。',
      assignee: '佐藤花子',
      estimatedTime: '3時間',
      status: '完了'
    }
  };

  // 子タスク2-2を作成
  const childTask2_2: TaskInfo = {
    id: generateTaskId(),
    text: '子タスク2-2',
    completed: false,
    level: 1,
    parentId: parentTask2.id,
    details: {
      tags: ['進行中', 'プロジェクトB', 'レビュー待ち'],
      priority: '中',
      dueDate: '2025-01-30',
      notes: '現在作業中。来週にはレビューに出せる予定です。コードレビューも並行して実施中。',
      assignee: '山田次郎',
      estimatedTime: '4時間',
      status: '進行中'
    }
  };

  // 子タスク2-3を作成
  const childTask2_3: TaskInfo = {
    id: generateTaskId(),
    text: '子タスク2-3',
    completed: false,
    level: 1,
    parentId: parentTask2.id,
    details: {
      tags: ['未着手', 'プロジェクトB', '設計'],
      priority: '低',
      dueDate: '2025-02-05',
      notes: '他のタスクが完了してから着手予定。準備は整っています。詳細設計から開始します。',
      assignee: '田中太郎',
      estimatedTime: '2時間',
      status: '未着手'
    }
  };

  // 通常のタスクを作成
  const normalTask: TaskInfo = {
    id: generateTaskId(),
    text: '通常のタスク',
    completed: false,
    level: 0,
    parentId: null,
    details: {
      tags: ['個人タスク', '調査', '学習'],
      priority: '中',
      dueDate: '2025-01-27',
      notes: '新しい技術の調査タスク。週末に時間を取って進める予定。React最新機能の調査を行います。',
      assignee: '自分',
      estimatedTime: '5時間',
      status: '進行中'
    }
  };

  // データベースに登録（キーはタスク名）
  database['親タスク1'] = parentTask1;
  database['子タスク1-1'] = childTask1_1;
  database['子タスク1-2'] = childTask1_2;
  database['親タスク2'] = parentTask2;
  database['子タスク2-1'] = childTask2_1;
  database['子タスク2-2'] = childTask2_2;
  database['子タスク2-3'] = childTask2_3;
  database['通常のタスク'] = normalTask;

  return database;
};

// データベース操作のユーティリティ関数
class TaskInfoDatabaseManager {
  private database: TaskInfoDatabase;

  constructor(initialDatabase?: TaskInfoDatabase) {
    this.database = initialDatabase || createTaskInfoDatabase();
  }

  // タスク名でTaskInfoを取得
  getTaskByName(taskName: string): TaskInfo | null {
    return this.database[taskName] || null;
  }

  // IDでTaskInfoを取得
  getTaskById(taskId: string): TaskInfo | null {
    return Object.values(this.database).find(task => task.id === taskId) || null;
  }

  // 全てのタスクを取得
  getAllTasks(): TaskInfo[] {
    return Object.values(this.database);
  }

  // 親タスクを取得
  getParentTasks(): TaskInfo[] {
    return Object.values(this.database).filter(task => task.level === 0);
  }

  // 子タスクを取得
  getChildTasks(parentId: string): TaskInfo[] {
    return Object.values(this.database).filter(task => task.parentId === parentId);
  }

  // タスクを追加
  addTask(taskInfo: TaskInfo): void {
    this.database[taskInfo.text] = taskInfo;
  }

  // タスクを更新
  updateTask(taskName: string, updatedTaskInfo: TaskInfo): void {
    if (this.database[taskName]) {
      // タスク名が変更された場合の処理
      if (taskName !== updatedTaskInfo.text) {
        delete this.database[taskName];
        this.database[updatedTaskInfo.text] = updatedTaskInfo;
      } else {
        this.database[taskName] = updatedTaskInfo;
      }
    }
  }

  // タスクを削除
  deleteTask(taskName: string): void {
    delete this.database[taskName];
  }

  // 検索機能
  searchTasks(query: string): TaskInfo[] {
    const lowerQuery = query.toLowerCase();
    return Object.values(this.database).filter(task => 
      task.text.toLowerCase().includes(lowerQuery) ||
      task.details.notes.toLowerCase().includes(lowerQuery) ||
      task.details.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
      task.details.assignee.toLowerCase().includes(lowerQuery)
    );
  }

  // ステータス別にタスクを取得
  getTasksByStatus(status: string): TaskInfo[] {
    return Object.values(this.database).filter(task => task.details.status === status);
  }

  // 優先度別にタスクを取得
  getTasksByPriority(priority: string): TaskInfo[] {
    return Object.values(this.database).filter(task => task.details.priority === priority);
  }

  // 担当者別にタスクを取得
  getTasksByAssignee(assignee: string): TaskInfo[] {
    return Object.values(this.database).filter(task => task.details.assignee === assignee);
  }

  // データベース全体を取得
  getDatabase(): TaskInfoDatabase {
    return { ...this.database };
  }

  // 統計情報を取得
  getStatistics() {
    const tasks = Object.values(this.database);
    return {
      total: tasks.length,
      completed: tasks.filter(t => t.completed).length,
      byPriority: {
        高: tasks.filter(t => t.details.priority === '高').length,
        中: tasks.filter(t => t.details.priority === '中').length,
        低: tasks.filter(t => t.details.priority === '低').length,
      },
      byStatus: {
        完了: tasks.filter(t => t.details.status === '完了').length,
        進行中: tasks.filter(t => t.details.status === '進行中').length,
        未着手: tasks.filter(t => t.details.status === '未着手').length,
        待機中: tasks.filter(t => t.details.status === '待機中').length,
        計画中: tasks.filter(t => t.details.status === '計画中').length,
      },
      byAssignee: this.groupByAssignee()
    };
  }

  private groupByAssignee() {
    const tasks = Object.values(this.database);
    const grouped: { [key: string]: number } = {};
    
    tasks.forEach(task => {
      const assignee = task.details.assignee;
      grouped[assignee] = (grouped[assignee] || 0) + 1;
    });
    
    return grouped;
  }
}

// 改良されたhandleTaskSelection
const improvedHandleTaskSelection = (
  taskText: string,
  taskDatabase: TaskInfoDatabaseManager,
  setSelectedTaskInfo: (taskInfo: TaskInfo) => void,
  setRightPanelContent: (content: string) => void,
  addLog: (message: string) => void
) => {
  addLog(`🎯 タスク選択: ${taskText}`);
  
  // TaskInfoDatabaseからTaskInfoを取得
  const taskInfo = taskDatabase.getTaskByName(taskText);
  
  if (taskInfo) {
    addLog(`✅ TaskInfoを取得: ${taskInfo.text} (ID: ${taskInfo.id})`);
    addLog(`📋 優先度: ${taskInfo.details.priority}, ステータス: ${taskInfo.details.status}`);
    addLog(`👤 担当者: ${taskInfo.details.assignee}, 期限: ${taskInfo.details.dueDate}`);
    
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
        tags: ['新規作成'],
        priority: '中',
        dueDate: '',
        notes: 'エディターから新しく作成されたタスクです。',
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

// 使用例
export const exampleUsage = () => {
  console.log('=== TaskInfoDatabase使用例 ===');
  
  // データベースマネージャーを作成
  const taskDB = new TaskInfoDatabaseManager();
  
  // 各種操作のテスト
  console.log('全タスク数:', taskDB.getAllTasks().length);
  console.log('親タスク:', taskDB.getParentTasks().map(t => t.text));
  
  const parentTask = taskDB.getTaskByName('親タスク1');
  if (parentTask) {
    console.log('親タスク1の子タスク:', taskDB.getChildTasks(parentTask.id).map(t => t.text));
  }
  
  console.log('高優先度タスク:', taskDB.getTasksByPriority('高').map(t => t.text));
  console.log('田中太郎のタスク:', taskDB.getTasksByAssignee('田中太郎').map(t => t.text));
  
  console.log('統計情報:', taskDB.getStatistics());
  
  // 検索テスト
  console.log('「プロジェクト」で検索:', taskDB.searchTasks('プロジェクト').map(t => t.text));
  
  return taskDB;
};

export {
  TaskInfoDatabase,
  createTaskInfoDatabase,
  TaskInfoDatabaseManager,
  improvedHandleTaskSelection,
  generateTaskId
};