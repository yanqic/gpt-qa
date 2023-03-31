import React, { useEffect, useMemo, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Answer, DocumentSources } from "@/components/Perplexity"
import ResizablePanel from "@/components/ResizablePanel"
import { SearchInput } from "@/components/SearchInput"
import { usePineconeQuery } from "@/hooks/use-pinecone-query"

export function PineconeQuery({ namespace }) {
  const {
    status,
    setStatus,
    userQuestion,
    setUserQuestion,
    pendingSourceDocs,
    generateAnswer,
    answerStream,
    messages,
  } = usePineconeQuery(namespace)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  function handleChange(e) {
    setStatus("typing")
    return setUserQuestion(e.target.value)
  }

  function handleSubmit(e) {
    setUserQuestion("")
    return generateAnswer(e)
  }

  function scrollToBottom() {
    return messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const chatMessages = useMemo(() => {
    return [
      ...messages,
      ...(answerStream
        ? [
            {
              type: "apiMessage",
              question: userQuestion,
              message: answerStream,
              sourceDocs: pendingSourceDocs,
            },
          ]
        : []),
    ]
  }, [messages, answerStream, pendingSourceDocs])

  const aiAnswer = chatMessages.filter(
    (message) => message.type === "apiMessage"
  )

  useEffect(() => {
    if (status === "complete") {
      window.setTimeout(() => scrollToBottom(), 400)
    }
  }, [chatMessages, status])

  return (
    <section className="container flex flex-col justify-items-stretch gap-6  pb-8 md:pb-10">
      <div className="flex flex-col items-center justify-center gap-2">
        <div className="max-w-4xl md:min-w-[750px]">
          <ResizablePanel>
            {aiAnswer &&
              aiAnswer.map((answer, i) => {
                return (
                  <AnimatePresence mode="wait" key={`answer-${i}`}>
                    <motion.div className="my-10 space-y-10">
                      <motion.div
                        className={cn(
                          "bg-neutral border-neutral-focus  overflow-x-auto rounded-xl border p-4 shadow-md",
                          "hover:border-accent-focus text-left transition",
                          status === "loading" ? "animate-pulse" : ""
                        )}
                      >
                        <Answer
                          content={answer.message}
                          error={status === "error"}
                          submittedQ={answer.question}
                        />
                        <DocumentSources sources={answer.sourceDocs} />
                      </motion.div>
                    </motion.div>
                  </AnimatePresence>
                )
              })}
          </ResizablePanel>
          <div className="flex max-w-4xl flex-col items-center justify-center md:min-w-[750px]">
            <SearchInput
              status={status}
              value={userQuestion}
              handleClick={handleSubmit}
              handleChange={handleChange}
              loading={status === "loading"}
              placeholder="Query Embeddings"
            />
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>
    </section>
  )
}
