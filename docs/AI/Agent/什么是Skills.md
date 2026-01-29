---
sidebar_position: 2
---

## 定义

Skills 是用于**扩展 AI Agent 能力**的模块化组件。例如：

- 发送邮件的能力
- 整理桌面文件的能力
- 操作数据库的能力

通过 Skills，AI Agent 可以帮我们完成更多复杂的实际任务。

---

## Skills vs MCP：有什么区别？

| 维度         | Skills                                             | MCP                                |
| ------------ | -------------------------------------------------- | ---------------------------------- |
| **定义**     | 定义在 AI Agent 本地，通过 metadata 和描述文件声明 | 标准化的服务协议，由第三方服务提供 |
| **实现方式** | 通过自然语言描述能力 + 本地可执行脚本              | 标准 API 接口，AI 调用后等待返回   |
| **运行位置** | 本地执行（脚本在用户机器上运行）                   | 远程执行（调用第三方服务）         |
| **扩展方式** | 文件夹形式，一个目录 = 一个 Skill，需下载到本地    | 配置 MCP Server 地址即可，无需下载 |
| **适用场景** | 本地操作（文件管理、系统控制等）                   | 远程服务（API 调用、数据查询等）   |

**简单理解**：

- **Skills** = 本地插件（需要下载安装）
- **MCP** = 远程服务（配置地址即可使用）

---

## 如何实现一个 Skill？

以「桌面整理工具」为例，展示完整的 Skill 开发流程。

### 目录结构

```
~/.clawd/skills/desktop-organizer/
├── SKILL.md              # Skill 定义文件
└── organize_desktop.py   # 执行脚本
```

---

### 第一步：编写执行脚本

`organize_desktop.py` - 自动识别桌面文件并分类：

```python
import os
import shutil
from pathlib import Path

def organize_desktop():
    desktop = Path.home() / "Desktop"

    # 定义分类规则
    mapping = {
        "Images": [".jpg", ".jpeg", ".png", ".gif", ".svg"],
        "Documents": [".pdf", ".docx", ".txt", ".xlsx", ".pptx", ".md"],
        "Archives": [".zip", ".tar", ".gz", ".rar"],
        "Scripts": [".py", ".sh", ".js", ".html"]
    }

    moved_count = 0
    for item in desktop.iterdir():
        # 跳过文件夹和隐藏文件
        if item.is_dir() or item.name.startswith("."):
            continue

        # 匹配后缀名并移动
        suffix = item.suffix.lower()
        for folder_name, extensions in mapping.items():
            if suffix in extensions:
                dest_dir = desktop / folder_name
                dest_dir.mkdir(exist_ok=True)
                shutil.move(str(item), str(dest_dir / item.name))
                moved_count += 1
                break

    return f"清理完成！共移动了 {moved_count} 个文件到分类文件夹中。"

if __name__ == "__main__":
    print(organize_desktop())
```

---

### 第二步：编写 Skill 定义文件

`SKILL.md` - 告诉 AI 这个 Skill 是做什么的、如何使用：

```markdown
---
name: organize-desktop
description: 自动整理用户桌面上的杂乱文件，将图片、文档、压缩包等分类移入对应的文件夹。
arguments: []
---

# 指令说明

当你（AI）认为用户想要清理或整理桌面时，请执行以下操作：

1. 告知用户：“正在扫描桌面并按文件类型分类...”
2. 运行本地 Python 脚本：`python3 ~/scripts/organize_desktop.py`
3. 获取脚本的输出结果（移动了多少文件）。
4. 向用户确认任务已完成，并简单列出分类后的文件夹。

# 注意事项

- 如果桌面已经很整洁，脚本会返回“移动了 0 个文件”，请如实告知用户。
- 仅处理桌面根目录下的文件，不会进入子文件夹。
```

---

### 第三步：使用 Skill

1. **加载技能**：告诉 AI "刷新技能列表，我添加了一个 `organize-desktop` 技能"
2. **触发技能**：使用自然语言触发
   - "我的桌面太乱了，帮我理一下"
   - "清理桌面"
   - "运行桌面整理工具"

---

## Skill 定义文件规范

```yaml
---
name: skill-name           # Skill 唯一标识
description: 描述文字       # AI 用来理解何时触发
arguments:                 # 可选参数
  - name: param1
    type: string
    required: true
---

# 指令说明
（自然语言描述 AI 应该如何执行这个 Skill）

# 注意事项
（边界情况、异常处理等）
```

---

## 总结

| 要素         | 说明                                     |
| ------------ | ---------------------------------------- |
| **执行脚本** | 实际完成任务的代码（Python/Shell/JS 等） |
| **SKILL.md** | 定义 Skill 的 metadata 和使用说明        |
| **存放位置** | 通常在 `~/.clawd/skills/{skill-name}/`   |
| **触发方式** | AI 根据用户意图自动匹配并执行            |
