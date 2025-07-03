/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/ban-types */
/**eslint-disable-next-line react-hooks/exhaustive-deps */

import { useCallback, useMemo, useState } from "react";

type SnapShot<T> = {
  state: T; // 存储完整的状态
};

// 用 WeakMap 来缓存已经创建的代理对象
const proxyMap = new WeakMap();

function createDeepProxy<T extends Object>(data: T, callback: Function): any {
  // 如果该对象已经被代理，直接返回缓存的代理对象
  if (proxyMap.has(data)) {
    return proxyMap.get(data);
  }

  const proxy = new Proxy(data, {
    get(target, key) {
      // 处理数组的内置方法
      if (Array.isArray(target) && typeof key === "string") {
        const arrayMethods = [
          "push",
          "pop",
          "shift",
          "unshift",
          "splice",
          "sort",
          "reverse",
        ];
        if (arrayMethods.includes(key)) {
          const original = target[key as keyof typeof target];
          return function (...args: any[]) {
            const result = original.apply(target, args);
            callback();
            return result;
          };
        }
      }

      const value = target[key as keyof typeof target];
      // 只在值被访问且是对象时才创建代理
      if (value && typeof value === "object") {
        return createDeepProxy(value, callback);
      }
      return value;
    },
    set(target, key, value) {
      target[key as keyof typeof target] = value;
      callback();
      return true;
    },
  });

  // 将创建的代理对象缓存起来
  proxyMap.set(data, proxy);
  return proxy;
}

function createProxy<T extends Object>(data: T, callback: Function) {
  const states = new Map<number, SnapShot<T>>();

  let index = 0; // 下标，数据每次更新会自增

  // 深拷贝初始状态
  states.set(index, { state: JSON.parse(JSON.stringify(data)) });

  const undoStack: SnapShot<T>[] = [];

  // 使用深度代理替换原来的代理
  const proxy = createDeepProxy(data, () => {
    index++;
    // 存储时进行深拷贝
    states.set(index, { state: JSON.parse(JSON.stringify(data)) });
    // 新增：当数据更新时，清空 undoStack
    undoStack.length = 0;
    callback();
  });

  // 实现撤销
  function undo() {
    if (index <= 0) return;

    // 保存当前状态到 undoStack
    const currentState = states.get(index)!;
    undoStack.push(currentState);

    // 获取前一个状态
    const prevState = states.get(index - 1)!;

    // 恢复整个状态
    Object.assign(data, prevState.state);

    states.delete(index);
    index--;
    callback();
  }

  function redo() {
    if (undoStack.length <= 0) return;

    const nextState = undoStack.pop()!;

    // 恢复整个状态
    Object.assign(data, nextState.state);

    index++;
    states.set(index, nextState);
    callback();
  }

  function getSnapShot() {
    const currentState = states.get(index);
    if (!currentState) return;
    return { ...currentState.state };
  }

  const canUndo = () => index > 0;

  const canRedo = () => undoStack.length > 0;

  return [proxy, { canUndo, canRedo, getSnapShot, undo, redo }] as const;
}

function useUpdate() {
  const [, setState] = useState({});
  return useCallback(() => setState({}), []);
}

export function useUndo<T extends Object>(initState: T) {
  const update = useUpdate();
  const [proxy, { canUndo, canRedo, getSnapShot, undo, redo }] = useMemo(() => {
    return createProxy(initState, update);
  }, []);

  const setter = (callback: (data: T) => void) => {
    callback(proxy);
  };

  const snapShot = getSnapShot() as T;
  return [
    snapShot,
    setter,
    { canUndo, canRedo, getSnapShot, undo, redo },
  ] as const;
}
