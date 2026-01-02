import type { TaskDetail } from '../types/task';

interface TaskDetailPanelProps {
  selectedTask: TaskDetail | null;
}

export function TaskDetailPanel({ selectedTask }: TaskDetailPanelProps) {
  return (
    <div style={{
      width: '400px',
      overflowY: 'auto',
      backgroundColor: '#f9fafb',
      padding: '24px'
    }}>
      <h2 style={{
        fontSize: '18px',
        fontWeight: 'bold',
        marginBottom: '16px',
        color: '#111827'
      }}>
        📋 タスク詳細
      </h2>

      {selectedTask ? (
        <div>
          {/* タスクテキスト */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              fontSize: '14px',
              fontWeight: '500',
              color: '#4b5563',
              display: 'block',
              marginBottom: '8px'
            }}>
              タスク名
            </label>
            <div style={{
              fontSize: '16px',
              padding: '12px',
              backgroundColor: 'white',
              borderRadius: '6px',
              border: '1px solid #e5e7eb',
              textDecoration: selectedTask.checked ? 'line-through' : 'none',
              opacity: selectedTask.checked ? 0.6 : 1
            }}>
              {selectedTask.text}
            </div>
          </div>

          {/* ステータス */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              fontSize: '14px',
              fontWeight: '500',
              color: '#4b5563',
              display: 'block',
              marginBottom: '8px'
            }}>
              ステータス
            </label>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '8px 16px',
              borderRadius: '9999px',
              fontSize: '14px',
              fontWeight: '500',
              backgroundColor: selectedTask.checked ? '#d1fae5' : '#fef3c7',
              color: selectedTask.checked ? '#065f46' : '#92400e'
            }}>
              {selectedTask.checked ? '✓ 完了' : '○ 未完了'}
            </div>
          </div>

          {/* 子タスク情報 */}
          {selectedTask.hasChildren && (
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                fontSize: '14px',
                fontWeight: '500',
                color: '#4b5563',
                display: 'block',
                marginBottom: '8px'
              }}>
                子タスク
              </label>
              <div style={{
                padding: '16px',
                backgroundColor: 'white',
                borderRadius: '6px',
                border: '1px solid #dbeafe'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '12px'
                }}>
                  <span style={{ fontSize: '14px', color: '#374151' }}>完了状況</span>
                  <span style={{ fontWeight: 'bold', color: '#1e40af', fontSize: '16px' }}>
                    {selectedTask.completedChildrenCount} / {selectedTask.childrenCount}
                  </span>
                </div>
                <div style={{
                  width: '100%',
                  backgroundColor: '#e5e7eb',
                  borderRadius: '9999px',
                  height: '10px'
                }}>
                  <div style={{
                    backgroundColor: '#2563eb',
                    height: '10px',
                    borderRadius: '9999px',
                    width: `${(selectedTask.completedChildrenCount / selectedTask.childrenCount) * 100}%`,
                    transition: 'width 0.3s ease'
                  }} />
                </div>
                <div style={{
                  marginTop: '8px',
                  fontSize: '12px',
                  color: '#6b7280',
                  textAlign: 'right'
                }}>
                  {Math.round((selectedTask.completedChildrenCount / selectedTask.childrenCount) * 100)}% 完了
                </div>
              </div>
            </div>
          )}

          {/* 情報メッセージ */}
          <div style={{
            padding: '12px',
            backgroundColor: 'white',
            borderRadius: '6px',
            fontSize: '14px',
            color: '#4b5563',
            border: '1px solid #e5e7eb'
          }}>
            <p style={{ marginBottom: '8px', fontWeight: '500' }}>💡 ヒント:</p>
            <ul style={{
              listStyleType: 'disc',
              paddingLeft: '20px',
              margin: 0,
              fontSize: '12px',
              lineHeight: '1.6'
            }}>
              <li>チェックボックスをクリックして完了/未完了を切り替え</li>
              <li>Tabキーで子タスクを作成</li>
              {selectedTask.hasChildren && (
                <li>すべての子タスクを完了すると親タスクも自動完了</li>
              )}
            </ul>
          </div>
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          color: '#9ca3af'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
          <p style={{ fontSize: '14px' }}>タスクを選択すると</p>
          <p style={{ fontSize: '14px' }}>詳細がここに表示されます</p>
        </div>
      )}
    </div>
  );
}
