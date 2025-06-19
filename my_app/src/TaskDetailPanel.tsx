import React from 'react';

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
  details: TaskDetails;
}

interface TaskDetailsDB {
  [key: string]: TaskDetails;
}

interface TaskDetailPanelProps {
  rightPanelContent: string;
  selectedTaskInfo: TaskInfo | null;
  taskDetailsDB: TaskDetailsDB;
  onReset: () => void;
  onTestClick: (contentType: string) => void;
}

interface ColorStyle {
  bg: string;
  color: string;
}

const TaskDetailPanel: React.FC<TaskDetailPanelProps> = ({ 
  rightPanelContent, 
  selectedTaskInfo, 
  taskDetailsDB,
  onReset,
  onTestClick 
}) => {
  // 優先度の色を取得
  const getPriorityColor = (priority: string): ColorStyle => {
    switch (priority) {
      case '高': return { bg: '#fecaca', color: '#dc2626' };
      case '中': return { bg: '#fef3c7', color: '#d97706' };
      case '低': return { bg: '#d1fae5', color: '#16a34a' };
      default: return { bg: '#f3f4f6', color: '#6b7280' };
    }
  };

  // ステータスの色を取得
  const getStatusColor = (status: string): ColorStyle => {
    switch (status) {
      case '完了': return { bg: '#dcfce7', color: '#166534' };
      case '進行中': return { bg: '#dbeafe', color: '#1e40af' };
      case '未着手': return { bg: '#f3f4f6', color: '#6b7280' };
      case '待機中': return { bg: '#fef3c7', color: '#d97706' };
      case '計画中': return { bg: '#e0e7ff', color: '#5b21b6' };
      default: return { bg: '#f3f4f6', color: '#6b7280' };
    }
  };

  // 右側のコンテンツを返す関数
  const renderRightContent = (): JSX.Element => {
    switch (rightPanelContent) {
      case 'task-detail':
        if (!selectedTaskInfo) {
          return <div>タスク情報が見つかりません</div>;
        }

        const priorityStyle = getPriorityColor(selectedTaskInfo.details.priority);
        const statusStyle = getStatusColor(selectedTaskInfo.details.status);

        return (
          <div>
            <div style={{ 
              textAlign: 'center',
              marginBottom: '24px',
              padding: '16px',
              backgroundColor: '#dbeafe',
              borderRadius: '8px'
            }}>
              <h1 style={{ 
                fontSize: '36px', 
                fontWeight: 'bold', 
                color: '#2563eb', 
                marginBottom: '8px' 
              }}>
                Hello World
              </h1>
              <p style={{ color: '#1e40af' }}>
                タスク「{selectedTaskInfo.text}」の詳細画面
              </p>
            </div>

            {/* タスク基本情報 */}
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
                📋 基本情報
              </h3>
              <div style={{ 
                backgroundColor: '#f9fafb', 
                borderRadius: '8px', 
                padding: '16px' 
              }}>
                <p style={{ 
                  fontSize: '18px', 
                  fontWeight: '600', 
                  marginBottom: '12px',
                  textDecoration: selectedTaskInfo.completed ? 'line-through' : 'none',
                  color: selectedTaskInfo.completed ? '#6b7280' : '#111827'
                }}>
                  {selectedTaskInfo.text}
                </p>
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    backgroundColor: selectedTaskInfo.completed ? '#dcfce7' : '#fef3c7',
                    color: selectedTaskInfo.completed ? '#166534' : '#92400e'
                  }}>
                    {selectedTaskInfo.completed ? '✅ 完了' : '⏳ 未完了'}
                  </span>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    backgroundColor: '#dbeafe',
                    color: '#1e40af'
                  }}>
                    レベル {selectedTaskInfo.level}
                  </span>
                  {selectedTaskInfo.parentId && (
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      backgroundColor: '#e0e7ff',
                      color: '#5b21b6'
                    }}>
                      親: {selectedTaskInfo.parentId}
                    </span>
                  )}
                </div>

                <p style={{ fontSize: '12px', color: '#6b7280' }}>
                  ID: {selectedTaskInfo.id}
                </p>
              </div>
            </div>

            {/* タグ */}
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
                🏷️ タグ
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {selectedTaskInfo.details.tags.map((tag: string, index: number) => (
                  <span key={index} style={{
                    padding: '6px 12px',
                    borderRadius: '16px',
                    fontSize: '12px',
                    backgroundColor: '#e0e7ff',
                    color: '#5b21b6',
                    fontWeight: '500'
                  }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* 詳細情報 */}
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
                ℹ️ 詳細情報
              </h3>
              <div style={{ 
                backgroundColor: '#f9fafb', 
                borderRadius: '8px', 
                padding: '16px',
                fontSize: '14px',
                lineHeight: '1.6'
              }}>
                <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
                  <strong>🔥 優先度:</strong> 
                  <span style={{
                    marginLeft: '8px',
                    padding: '2px 8px',
                    borderRadius: '8px',
                    backgroundColor: priorityStyle.bg,
                    color: priorityStyle.color,
                    fontSize: '12px'
                  }}>
                    {selectedTaskInfo.details.priority}
                  </span>
                </div>
                <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
                  <strong>📊 ステータス:</strong> 
                  <span style={{
                    marginLeft: '8px',
                    padding: '2px 8px',
                    borderRadius: '8px',
                    backgroundColor: statusStyle.bg,
                    color: statusStyle.color,
                    fontSize: '12px'
                  }}>
                    {selectedTaskInfo.details.status}
                  </span>
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <strong>📅 期限:</strong> {selectedTaskInfo.details.dueDate || '未設定'}
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <strong>👤 担当者:</strong> {selectedTaskInfo.details.assignee}
                </div>
                <div>
                  <strong>⏱️ 予想時間:</strong> {selectedTaskInfo.details.estimatedTime}
                </div>
              </div>
            </div>

            {/* 補足情報 */}
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
                📝 補足情報
              </h3>
              <div style={{ 
                backgroundColor: '#f0fdf4', 
                borderRadius: '8px', 
                padding: '16px',
                fontSize: '14px',
                lineHeight: '1.6',
                color: '#374151'
              }}>
                {selectedTaskInfo.details.notes}
              </div>
            </div>
          </div>
        );

      case 'test-content':
        return (
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '48px', color: '#dc2626', marginBottom: '16px' }}>
              テスト画面
            </h1>
            <p>ボタンクリックで画面が切り替わりました！</p>
          </div>
        );

      default:
        return (
          <div style={{ textAlign: 'center', marginTop: '100px' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>📝</div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
              タスクを選択してください
            </h3>
            <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '24px' }}>
              左側のエディタでタスクの文字部分をクリックすると<br />
              詳細情報がここに表示されます
            </p>
            
            {/* テスト用ボタン */}
            <div style={{ marginTop: '32px' }}>
              <button 
                onClick={() => onTestClick('test-content')}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  marginRight: '8px'
                }}
              >
                テスト画面に切り替え
              </button>
              <button 
                onClick={() => onTestClick('task-detail')}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                タスク詳細画面に切り替え
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div style={{ 
      width: '400px',
      backgroundColor: 'white', 
      borderLeft: '1px solid #d1d5db',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* ヘッダー */}
      <div style={{ 
        padding: '16px', 
        borderBottom: '1px solid #d1d5db', 
        backgroundColor: '#f9fafb' 
      }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600' }}>
          📋 {selectedTaskInfo ? `${selectedTaskInfo.text}の詳細` : '詳細パネル'} ({rightPanelContent})
        </h2>
      </div>
      
      {/* コンテンツ */}
      <div style={{ flex: 1, padding: '16px', overflow: 'auto' }}>
        {renderRightContent()}
      </div>
      
      {/* フッター */}
      <div style={{ 
        padding: '16px', 
        borderTop: '1px solid #d1d5db', 
        backgroundColor: '#f9fafb' 
      }}>
        <button 
          onClick={onReset}
          style={{
            width: '100%',
            padding: '8px 16px',
            backgroundColor: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          リセット
        </button>
      </div>
    </div>
  );
};

export default TaskDetailPanel;