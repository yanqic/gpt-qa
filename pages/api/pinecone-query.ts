import type { NextApiRequest, NextApiResponse } from "next"
import { makePdfChain } from "@/loaders/llm"
import { OpenAIEmbeddings } from "langchain/embeddings"
import { PineconeStore } from "langchain/vectorstores"
import { initPinecone } from "@/config/pinecone"

function prepareResponse(res: NextApiResponse) {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
  })
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { namespace } = req.headers
  console.log("namespace", namespace)

  if (!req.body.question) {
    return res.status(400).json({ message: "No question in the request" })
  }

  const pinecone = await initPinecone()
  const index = pinecone.Index(process.env.PINECONE_INDEX_NAME)
  const namespaceConfig = !!namespace ? namespace : "default-namespace"

  const vectorStore = await PineconeStore.fromExistingIndex(
    index,
    new OpenAIEmbeddings({}),
    "text",
    // @ts-ignore
    namespaceConfig
    // namespace ? namespace : process.env.PINECONE_NAMESPACE
  )

  prepareResponse(res)
  await createChainAndSendResponse(req, res, vectorStore)
}

async function createChainAndSendResponse(
  req: NextApiRequest,
  res: NextApiResponse,
  vectorStore: any
) {
  const { question, history } = req.body
  const sanitizedQuestion = question.trim().replaceAll("\n", " ")

  const sendData = (data: string) => {
    res.write(`data: ${data}\n\n`)
  }

  sendData(JSON.stringify({ question: sanitizedQuestion }))
  sendData(JSON.stringify({ data: "" }))

  const chain = makePdfChain(vectorStore, (token: string) => {
    sendData(JSON.stringify({ data: token }))
  })

  try {
    const response = await chain.call({
      question: sanitizedQuestion,
      chat_history: history || [],
    })

    sendData(JSON.stringify({ sourceDocs: response.sourceDocuments }))
  } catch (error) {
    console.log("error", error)
  } finally {
    sendData("[DONE]")
    res.end()
  }
}

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse
// ) {
//   const pinecone = await initPinecone()
//   const { question, history, namespace } = req.body

//   if (!question) {
//     return res.status(400).json({ message: "No question in the request" })
//   }
//   // OpenAI recommends replacing newlines with spaces for best results
//   const sanitizedQuestion = question.trim().replaceAll("\n", " ")

//   const index = pinecone.Index("mercury")

//   /* create vectorstore*/
//   const vectorStore = await PineconeStore.fromExistingIndex(
//     index,
//     new OpenAIEmbeddings({}),
//     "text",
//     !!namespace ? namespace : "pdf-test-3" //optional
//   )

//   res.writeHead(200, {
//     "Content-Type": "text/event-stream",
//     "Cache-Control": "no-cache, no-transform",
//     Connection: "keep-alive",
//   })

//   const sendData = (data: string) => {
//     res.write(`data: ${data}\n\n`)
//   }

//   sendData(JSON.stringify({ question: sanitizedQuestion }))

//   sendData(JSON.stringify({ data: "" }))

//   //create chain
//   const chain = makePdfChain(vectorStore, (token: string) => {
//     sendData(JSON.stringify({ data: token }))
//   })

//   try {
//     //Ask a question
//     const response = await chain.call({
//       question: sanitizedQuestion,
//       chat_history: history || [],
//     })

//     console.log("response", response)

//     sendData(JSON.stringify({ sourceDocs: response.sourceDocuments }))
//   } catch (error) {
//     console.log("error", error)
//   } finally {
//     sendData("[DONE]")
//     res.end()
//   }
// }
