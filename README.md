## use-undo-hook

一个支持可变数据的撤销重做 React Hook。

## 使用场景

- 表单编辑需要撤销重做

- 画板操作需要撤销重做

- 任何需要状态管理且要支持撤销/重做的场景

## 安装

```bash
npm install use-undo-hook
```

## 使用示例

```tsx
import { useUndo } from "use-undo-hook";

function App() {
  const [state, setState, { undo, redo, canUndo, canRedo }] = useUndo({
    count: 0,
    text: ["hello"],
    user: { name: "wong" },
  });

  return (
    <div>
      <button onClick={() => setState((s) => s.count++)}>
        Count: {state.count}
      </button>

      <button onClick={() => setState((s) => s.text.push("world"))}>
        Add Text
      </button>

      <button disabled={!canUndo()} onClick={undo}>
        撤销
      </button>
      <button disabled={!canRedo()} onClick={redo}>
        重做
      </button>
    </div>
  );
}
```

## 特性

- 支持对象、数组等复杂数据结构

- 支持可变数据操作

- 完整的 TypeScript 类型支持

- 零依赖，体积小巧

## 开发

```bash
# 安装依赖
npm install

# 开发调试
npm run dev

# 构建
npm run build
```
