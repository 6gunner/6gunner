ElizaOS Agent Framework

agent 的底层技术框架都大同小异，所以先看eliza的技术架构

<img src="https://ipic-coda-hz.oss-cn-hangzhou.aliyuncs.com/2025-02-07/image-20250207110914154.png" alt="image-20250207110914154" style={{ zoom: '50%' }} />

## 架构分析

### Provider的分析

#### 1、为什么需要agent provider？

因为AI-Model往往没有获取外部数据的能力，比如给它一个网址，他没法获取网站内容的。

再比如AI没法获取链上数据的信息，但是他能提供代码帮我们去获取。

所以我们就需要自己封装Provider，将这部分获取数据的能力写到自己的Provider里。

#### 2、AI 如何理解Provider 提供的信息？

AI需要的是自然语言，所以我们要将数据转化成AI需要的promt，这点也需要实现在provider里。

provider先通过get方法来获取数据

```tsx
export interface Provider {
  /** Data retrieval function */
  get: (runtime: IAgentRuntime, message: Memory, state?: State) => Promise<any>;
}
```

然后不同的provider有对应的format方法，将数据转化为`Natural Language`

<img src="https://ipic-coda-hz.oss-cn-hangzhou.aliyuncs.com/2025-02-05/Gf8-n5TawAEtRyg.jpeg" alt="Image" style={{ zoom: '50%' }} />

### Action的分析

#### 1、什么是Action？

包括不限于：

• Placing Buy & Sell Orders

• Analyzing PDF documents

• Transcribing audio files

• Generating NFTs (Non-Fungible Tokens)

#### 2、Eliza框架为什么需要Action？

同Provider，AI不能帮我们做一些具体事情，比如我们希望给AI一个私钥（当然这个不安全），让AI帮我们去链上swap一些token，这个大模型肯定无法做到。因此就需要我们封装一些Action，当AI分析出用户想要做这类Action的时候，就调用Action Handler来去执行这些动作。

#### 3、Action执行后的结果是怎么告知AI的

通过memory机制。当action执行完后，会将每轮的message转化为memory，然后进行存储。

（todo 这里我还没理解memory是怎么设计的）

```ts
// 这里会把userMessage和AI response组合，然后create memory
// save response to memory
const responseMessage: Memory = {
  id: stringToUuid(messageId + '-' + runtime.agentId),
  ...userMessage,
  userId: runtime.agentId,
  content: response,
  embedding: getEmbeddingZeroVector(),
  createdAt: Date.now(),
};

await runtime.messageManager.createMemory(responseMessage);
```

#### 4、Action字段怎么设计的？

```ts
export interface Action {
  /** Similar action descriptions */
  similes: string[];

  /** Detailed description */
  description: string;

  /** Example usages */
  examples: ActionExample[][];

  /** Handler function */
  handler: Handler;

  /** Action name */
  name: string;

  /** Validation function */
  validate: Validator;

  /** Whether to suppress the initial message when this action is used */
  suppressInitialMessage?: boolean;
}
```

##### examples

examples主要是用来帮助AI来理解，从不同的场景中，得到不同的action。

mint nft的examples：

```ts
[
    {
        user: "{{user1}}",
        content: {
            text: "Can you mint an NFT for D8j4ubQ3MKwmAqiJw83qT7KQNKjhsuoC7zJJdJa5BkvS collection on Solana?",
        },
    },
    {
        user: "{{agentName}}",
        content: {
            text: "I've completed minting your NFT in the collection on Solana.",
            action: "MINT_NFT",
        },
    },
],
```

##### handler

handler就是具体的action是怎么实现的，里面写了具体代码逻辑；

### Memory的分析

#### 1、什么是Memory？

memory就是AI Agent里的记忆能力，可以加强Ai agent的思考能力，有助于形成AI Agent自己的认知。

它存储的信息：

- 在Provider阶段从环境中获取的信息
- Action执行后结果的信息压缩之后， 存储进入Memory之中；

- 也会存储一些**Evaluator跟人类对话或者其他任意交互过程中**，提取出来的关键信息

### Evaluator的分析

#### 1、Evaluator是用来干嘛的？

evaluator主要就是通过分析用户的message，AI model的response，从中总结出一些knowledge（这个词不知道用什么好），然后记录到我们的DB上。这样下次我们就能让AI model根据这些knowledge，得到更符合预期的答案。

有点类似人类的经验能力，也可以理解让AI agent拥有了memory能力，从而拥有更好的上下文情境意识。

#### 2、Evaluator怎么设计的？

Evaluator的类型定义

```ts
export interface Evaluator {
  /** Whether to always run */
  alwaysRun?: boolean;

  /** Detailed description */
  description: string;

  /** Similar evaluator descriptions 类似的evaluator*/
  similes: string[];

  /** Example evaluations */
  examples: EvaluationExample[];

  /** Handler function */
  handler: Handler;

  /** Evaluator name */
  name: string;

  /** Validation function */
  validate: Validator;
}
```

Evaluator里的examples展示了如何从messages中，抽离出期望得到的信息。

具体的实现应该是程序会调用需要执行的所有Evaluator handler，从userMessage + response生成的memory里，抽离出某一类具体的信息，再将这类信息转化为memory，存储到DB里。

举个例子：FactEvaluator是用来从对话种抽取出“事实信息”的。

```tsx
export const factEvaluator: Evaluator = {
  name: 'GET_FACTS',
  similes: [
    'GET_CLAIMS',
    'EXTRACT_CLAIMS',
    'EXTRACT_FACTS',
    'EXTRACT_CLAIM',
    'EXTRACT_INFORMATION',
  ],
  validate: async (
    runtime: IAgentRuntime,

    message: Memory
  ): Promise<boolean> => {
    const messageCount = (await runtime.messageManager.countMemories(
      message.roomId
    )) as number;

    const reflectionCount = Math.ceil(runtime.getConversationLength() / 2);

    return messageCount % reflectionCount === 0;
  },
  description:
    'Extract factual information about the people in the conversation, the current events in the world, and anything else that might be important to remember.',
  handler,
  examples: [
    {
      context: `Actors in the scene:
{{user1}}: Programmer and moderator of the local story club.
{{user2}}: New member of the club. Likes to write and read.

Facts about the actors:
None`,
      messages: [
        {
          user: '{{user1}}',
          content: { text: 'So where are you from' },
        },
        {
          user: '{{user2}}',
          content: { text: "I'm from the city" },
        },
        {
          user: '{{user1}}',
          content: { text: 'Which city?' },
        },
        {
          user: '{{user2}}',
          content: { text: 'Oakland' },
        },
        {
          user: '{{user1}}',
          content: {
            text: "Oh, I've never been there, but I know it's in California",
          },
        },
      ] as ActionExample[],
      outcome: `{ "claim": "{{user2}} is from Oakland", "type": "fact", "in_bio": false, "already_known": false },`,
    },
    {
      context: `Actors in the scene:
{{user1}}: Athelete and cyclist. Worked out every day for a year to prepare for a marathon.
{{user2}}: Likes to go to the beach and shop.

Facts about the actors:
{{user1}} and {{user2}} are talking about the marathon
{{user1}} and {{user2}} have just started dating`,
      messages: [
        {
          user: '{{user1}}',
          content: {
            text: 'I finally completed the marathon this year!',
          },
        },
        {
          user: '{{user2}}',
          content: { text: 'Wow! How long did it take?' },
        },
        {
          user: '{{user1}}',
          content: { text: 'A little over three hours.' },
        },
        {
          user: '{{user1}}',
          content: { text: "I'm so proud of myself." },
        },
      ] as ActionExample[],
      outcome: `Claims:
json\`\`\`
[
  { "claim": "Alex just completed a marathon in just under 4 hours.", "type": "fact", "in_bio": false, "already_known": false },
  { "claim": "Alex worked out 2 hours a day at the gym for a year.", "type": "fact", "in_bio": true, "already_known": false },
  { "claim": "Alex is really proud of himself.", "type": "opinion", "in_bio": false, "already_known": false }
]
\`\`\`
`,
    },
    {
      context: `Actors in the scene:
{{user1}}: Likes to play poker and go to the park. Friends with Eva.
{{user2}}: Also likes to play poker. Likes to write and read.

Facts about the actors:
Mike and Eva won a regional poker tournament about six months ago
Mike is married to Alex
Eva studied Philosophy before switching to Computer Science`,
      messages: [
        {
          user: '{{user1}}',
          content: {
            text: 'Remember when we won the regional poker tournament last spring',
          },
        },
        {
          user: '{{user2}}',
          content: {
            text: 'That was one of the best days of my life',
          },
        },
        {
          user: '{{user1}}',
          content: {
            text: 'It really put our poker club on the map',
          },
        },
      ] as ActionExample[],
      outcome: `Claims:
json\`\`\`
[
  { "claim": "Mike and Eva won the regional poker tournament last spring", "type": "fact", "in_bio": false, "already_known": true },
  { "claim": "Winning the regional poker tournament put the poker club on the map", "type": "opinion", "in_bio": false, "already_known": false }
]
\`\`\``,
    },
  ],
};
```

看他的handler实现：

这个handler的主要目的是从对话中提取新的、有效的事实，并将它们存储在系统的内存中，同时确保不会重复存储已知信息或无效信息。

```tsx
async function handler(runtime: IAgentRuntime, message: Memory) {
  const state = await runtime.composeState(message);

  const { agentId, roomId } = state;

  const context = composeContext({
    state,
    template: runtime.character.templates?.factsTemplate || factsTemplate,
  });

  const facts = await generateObjectArray({
    runtime,
    context,
    modelClass: ModelClass.LARGE,
  });

  const factsManager = new MemoryManager({
    runtime,
    tableName: 'facts',
  });

  if (!facts) {
    return [];
  }

  // If the fact is known or corrupted, remove it
  const filteredFacts = facts
    .filter((fact) => {
      return (
        !fact.already_known &&
        fact.type === 'fact' &&
        !fact.in_bio &&
        fact.claim &&
        fact.claim.trim() !== ''
      );
    })
    .map((fact) => fact.claim);

  for (const fact of filteredFacts) {
    const factMemory = await factsManager.addEmbeddingToMemory({
      userId: agentId!,
      agentId,
      content: { text: fact },
      roomId,
      createdAt: Date.now(),
    });

    await factsManager.createMemory(factMemory, true);

    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  return filteredFacts;
}
```

#### 3、Evaluator的运行机制

系统里定义了很多evaluator，且这些evaluator在每次调用message的时候，都会遍历执行一次；而不是像provider或action这些只是在需要的时候执行。

在 `runtime.ts` 中的 `evaluate` 方法展示了Evaluator的工作流程:

```tsx
async evaluate(message: Memory, state: State, didRespond?: boolean, callback?: HandlerCallback) {
    // 1. 遍历所有Evaluator
    const evaluatorPromises = this.evaluators.map(async (evaluator: Evaluator) => {
        if (!evaluator.handler) return null;
        // 2. 检查是否需要运行
        if (!didRespond && !evaluator.alwaysRun) return null;
        // 3. 验证Evaluator是否适用
        const result = await evaluator.validate(this, message, state);
        if (result) return evaluator;
        return null;
    });

    // 4. 获取所有可用的Evaluator
    const resolvedEvaluators = await Promise.all(evaluatorPromises);
    const evaluatorsData = resolvedEvaluators.filter((evaluator): evaluator is Evaluator => evaluator !== null);

    // 5. 如果没有Evaluator,则返回
    if (!evaluatorsData || evaluatorsData.length === 0) return [];

    // 6. 生成评估上下文
    const context = composeContext({...});

    // 7. 生成文本评估结果
    const result = await generateText({...});

    // 8. 解析评估结果
    const evaluators = parseJsonArrayFromText(result) as unknown as string[];

    // 9. 执行Evaluator处理函数
    for (const evaluator of this.evaluators) {
        if (!evaluators?.includes(evaluator.name)) continue;
        if (evaluator.handler)
            await evaluator.handler(this, message, state, {}, callback);
    }

    return evaluators;
}
```

工作流程说明:

- 每个Evaluator需要有一个 validate 函数来判断是否应该被执行
- Evaluator可以通过 alwaysRun 标记来决定是否每次都运行
- Evaluator会根据message和state来决定是否需要执行特定操作
- Evaluator可以有examples来说明其工作方式
- 评估结果由 handler 函数处理并执行相应操作

## 整体的Eliza流程分析
