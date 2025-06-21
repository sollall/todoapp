// taskClickHandler.ts - タスククリックハンドラーの分離

// タスクテキスト抽出関数
export const extractTaskText = (taskItem: Element): string => {
  const taskText = Array.from(taskItem.childNodes)
    .filter(node => 
      node.nodeType === Node.TEXT_NODE || 
      (node.nodeType === Node.ELEMENT_NODE && !(node as Element).matches('ul'))
    )
    .map(node => node.textContent)
    .join('')
    .trim();
  
  return taskText;
};

// メインのクリックハンドラー作成関数
export const createTaskClickHandler = (
  setClickedTaskName: (taskName: string) => void
) => {
  return (event: Event) => {
    const target = event.target as HTMLElement;
    
    console.log('クリックイベント発生:', target);
    
    // チェックボックスのクリックは無視
    if (target.tagName.toLowerCase() === 'input') {
      console.log('チェックボックスクリック - 無視');
      return;
    }

    // タスクアイテムを探す
    const taskItem = target.closest('li[data-type="taskItem"]');
    
    if (taskItem) {
      console.log('タスクアイテム見つかりました:', taskItem);
      
      // タスクのテキストを取得
      const taskText = extractTaskText(taskItem);
      console.log('抽出されたタスクテキスト:', taskText);

      if (taskText) {
        setClickedTaskName(taskText);
        console.log('タスク名を設定:', taskText);
      }
    } else {
      console.log('タスクアイテムが見つかりませんでした');
    }
  };
};

// イベントリスナーの設定と削除を管理するクラス
export class TaskClickManager {
  private handler: (event: Event) => void;
  private element: HTMLElement | null = null;

  constructor(setClickedTaskName: (taskName: string) => void) {
    this.handler = createTaskClickHandler(setClickedTaskName);
  }

  // イベントリスナーを設定
  attachTo(element: HTMLElement) {
    this.detach(); // 既存のリスナーを削除
    this.element = element;
    element.addEventListener('click', this.handler);
    console.log('イベントリスナー設定完了');
  }

  // イベントリスナーを削除
  detach() {
    if (this.element) {
      this.element.removeEventListener('click', this.handler);
      console.log('イベントリスナー削除完了');
      this.element = null;
    }
  }

  // ハンドラーを再設定（エディター更新時用）
  reattachTo(element: HTMLElement) {
    this.attachTo(element);
  }
}

// より詳細なデバッグ用のハンドラー
export const createDebugTaskClickHandler = (
  setClickedTaskName: (taskName: string) => void,
  enableDebug: boolean = true
) => {
  return (event: Event) => {
    const target = event.target as HTMLElement;
    
    if (enableDebug) {
      console.group('🔍 タスククリック デバッグ');
      console.log('イベントターゲット:', target);
      console.log('タグ名:', target.tagName);
      console.log('クラス:', target.className);
      console.log('テキスト:', target.textContent);
    }
    
    // チェックボックスのクリックは無視
    if (target.tagName.toLowerCase() === 'input') {
      if (enableDebug) {
        console.log('❌ チェックボックスクリック - 処理をスキップ');
        console.groupEnd();
      }
      return;
    }

    // タスクアイテムを探す
    const taskItem = target.closest('li[data-type="taskItem"]');
    
    if (taskItem) {
      if (enableDebug) {
        console.log('✅ タスクアイテム発見:', taskItem);
        console.log('data-checked:', taskItem.getAttribute('data-checked'));
      }
      
      // タスクのテキストを取得
      const taskText = extractTaskText(taskItem);
      
      if (enableDebug) {
        console.log('📝 抽出されたテキスト:', taskText);
      }

      if (taskText) {
        setClickedTaskName(taskText);
        if (enableDebug) {
          console.log('🎯 タスク名設定完了:', taskText);
        }
      }
    } else {
      if (enableDebug) {
        console.log('❌ タスクアイテムが見つかりません');
        console.log('親要素を確認:', target.parentElement);
      }
    }
    
    if (enableDebug) {
      console.groupEnd();
    }
  };
};

// React Hook として使用するためのカスタムフック
export const useTaskClickHandler = (setClickedTaskName: (taskName: string) => void) => {
  const clickManager = new TaskClickManager(setClickedTaskName);
  
  return {
    attachClickHandler: (element: HTMLElement) => clickManager.attachTo(element),
    detachClickHandler: () => clickManager.detach(),
    reattachClickHandler: (element: HTMLElement) => clickManager.reattachTo(element)
  };
};

// エディターのイベントリスナー管理用カスタムフック
export const useEditorClickHandler = (
  editor: any, 
  setClickedTaskName: (taskName: string) => void,
  enableDebug: boolean = true
) => {
  const clickManagerRef = useRef<TaskClickManager | null>(null);
  
  // クリックマネージャーを初期化
  useEffect(() => {
    if (!clickManagerRef.current) {
      clickManagerRef.current = new TaskClickManager(setClickedTaskName);
    }
  }, [setClickedTaskName]);

  // エディターが準備できたらイベントリスナーを設定
  useEffect(() => {
    if (editor && editor.view && editor.view.dom && clickManagerRef.current) {
      if (enableDebug) {
        console.log('🎯 useEditorClickHandler: エディター準備完了、イベントリスナー設定');
      }
      
      const editorElement = editor.view.dom as HTMLElement;
      clickManagerRef.current.attachTo(editorElement);
      
      return () => {
        if (enableDebug) {
          console.log('🎯 useEditorClickHandler: クリーンアップ実行');
        }
        clickManagerRef.current?.detach();
      };
    }
  }, [editor, enableDebug]);

  // エディター更新時の再設定用関数
  const reattachToEditor = useCallback(() => {
    if (editor && editor.view && editor.view.dom && clickManagerRef.current) {
      if (enableDebug) {
        console.log('🎯 useEditorClickHandler: エディター更新 - リスナー再設定');
      }
      const editorElement = editor.view.dom as HTMLElement;
      clickManagerRef.current.reattachTo(editorElement);
    }
  }, [editor, enableDebug]);

  return {
    reattachToEditor
  };
};

// より詳細な制御が必要な場合の高度なフック
export const useAdvancedEditorClickHandler = (
  editor: any,
  setClickedTaskName: (taskName: string) => void,
  options: {
    enableDebug?: boolean;
    autoReattachOnUpdate?: boolean;
    customHandler?: (event: Event) => void;
  } = {}
) => {
  const {
    enableDebug = true,
    autoReattachOnUpdate = true,
    customHandler
  } = options;

  const handlerRef = useRef<((event: Event) => void) | null>(null);
  const editorElementRef = useRef<HTMLElement | null>(null);

  // ハンドラーを作成
  useEffect(() => {
    if (customHandler) {
      handlerRef.current = customHandler;
    } else {
      handlerRef.current = createDebugTaskClickHandler(setClickedTaskName, enableDebug);
    }
  }, [setClickedTaskName, enableDebug, customHandler]);

  // イベントリスナーの設定
  const attachListener = useCallback(() => {
    if (editor && editor.view && editor.view.dom && handlerRef.current) {
      const editorElement = editor.view.dom as HTMLElement;
      
      // 既存のリスナーを削除
      if (editorElementRef.current && handlerRef.current) {
        editorElementRef.current.removeEventListener('click', handlerRef.current);
      }
      
      // 新しいリスナーを追加
      editorElement.addEventListener('click', handlerRef.current);
      editorElementRef.current = editorElement;
      
      if (enableDebug) {
        console.log('🚀 useAdvancedEditorClickHandler: リスナー設定完了');
      }
    }
  }, [editor, enableDebug]);

  // リスナーの削除
  const detachListener = useCallback(() => {
    if (editorElementRef.current && handlerRef.current) {
      editorElementRef.current.removeEventListener('click', handlerRef.current);
      editorElementRef.current = null;
      
      if (enableDebug) {
        console.log('🚀 useAdvancedEditorClickHandler: リスナー削除完了');
      }
    }
  }, [enableDebug]);

  // 初期設定
  useEffect(() => {
    attachListener();
    return detachListener;
  }, [attachListener, detachListener]);

  return {
    attachListener,
    detachListener,
    reattachListener: attachListener
  };
};

// 必要なReactフックをインポート（ファイルの上部に追加）
import { useEffect, useRef, useCallback } from 'react';