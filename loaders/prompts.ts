import {
  HumanMessagePromptTemplate,
  PromptTemplate,
  SystemMessagePromptTemplate,
} from "langchain/prompts"

// const CONDENSE_PROMPT = new PromptTemplate({
//   template: `Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question.
//   Chat History:
//   {chat_history}
//   Follow Up Input: {question}
//   Standalone question:`,
//   inputVariables: ["chat_history", "question"],
// })

// const QA_PROMPT = new PromptTemplate({
//   template: `You are an AI assistant providing helpful advice. You are given the following extracted parts of a long document and a question. Provide a conversational answer based on the context provided.
//   You should only provide hyperlinks that reference the context below. Do NOT make up hyperlinks.
//   If you can't find the answer in the context below, just say "Hmm, I'm not sure." Don't try to make up an answer.
//   If the question is not related to the context, politely respond that you are tuned to only answer questions that are related to the context.
//   Question: {question}
//   =========
//   {context}
//   =========
//   Answer in Markdown:`,
//   inputVariables: ["question", "context"],
// })

const CONDENSE_PROMPT =
  PromptTemplate.fromTemplate(`Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question.
Chat History:
{chat_history}
Follow Up Input: {question}
Standalone question:`)

const QA_PROMPT = PromptTemplate.fromTemplate(
  `您是提供有用建议的 AI 助手。 您将获得一份长文档的以下提取部分和一个问题。 根据提供的上下文提供对话答案。
  您应该只提供引用以下上下文的超链接。 不要组成超链接。
  如果你在下面的上下文中找不到答案，就说“哦，我不太确定。” 不要试图编造答案。
  如果问题与上下文无关，请礼貌地回答你只能回答与上下文相关的问题.
Question: {question}
=========
{context}
=========
reply on 中文
Answer in Markdown:`
)

export { CONDENSE_PROMPT, QA_PROMPT }
