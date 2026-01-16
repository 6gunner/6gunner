
### 1. __createQuery - 查询数据__

```typescript
// 你的 useChatMessages 示例
export const useChatMessages = createQuery<Response, Variables, AxiosError>({
  queryKey: ['chat', 'messages'],
  fetcher: (variables) => {
    // 数据获取逻辑
    if (variables.chat_id !== undefined) {
      // 构建查询参数
      const params = new URLSearchParams();
      params.append('scene', variables.scene);
      
      return client
        .get(`api/v1/chat/${variables.chat_id}/messages?${params.toString()}`)
        .then((response) => response.data.data.list);
    }
  },
});
```

__关键特性：__

- __强类型支持__: `<Response, Variables, AxiosError>` 提供完整的类型安全
- __自动 queryKey 管理__: variables 会自动添加到 queryKey 中
- __条件查询__: 当 `variables.chat_id` 为 undefined 时，查询不会执行

### 2. __createMutation - 修改数据__

```typescript
// 你的 useAddPost 示例
export const useAddPost = createMutation<Response, Variables, AxiosError>({
  mutationFn: async (variables) =>
    client({
      url: 'posts/add',
      method: 'POST',
      data: variables,
    }).then((response) => response.data),
});
```

### 3. __使用方式对比__

__React Query Kit 方式：__

```typescript
// 在组件中使用
const { data, isLoading, error } = useChatMessages({
  variables: { 
    chat_id: '123', 
    scene: 'default',
    page: 1,
    page_size: 20
  }
});

// Mutation 使用
const addPost = useAddPost();
addPost.mutate({ 
  title: 'New Post', 
  body: 'Content', 
  userId: 1 
});
```

__传统 useQuery 方式：__

```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ['chat', 'messages', { chat_id: '123', scene: 'default' }],
  queryFn: () => fetchChatMessages({ chat_id: '123', scene: 'default' }),
  enabled: !!chat_id,
});
```

## React Query Kit 的优势

### 1. __类型安全__

- 编译时检查 variables 类型
- Response 类型自动推断
- Error 类型明确定义

### 2. __代码组织__

- 每个 API 调用都有独立的文件
- 统一的项目结构
- 更好的可维护性

### 3. __自动优化__

- queryKey 自动包含 variables
- 缓存键自动生成
- 避免手动管理依赖

### 4. __开发体验__

- 更好的 IDE 支持
- 自动补全
- 重构更安全

##
