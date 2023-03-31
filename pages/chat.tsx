import Image from "next/image"
import { Toaster } from "react-hot-toast"
import { Layout } from "@/components/Layouts"
import { Chat } from "@/components/query/Chat"

function ChatPage() {
  return (
    <Layout>
      <div className="mx-auto flex min-h-screen flex-col items-center  py-2">
        <main className="mx-auto  flex min-h-screen w-full flex-1 flex-col items-center  px-4 py-2 text-center sm:mt-12">
          <h1 className="mb-6 max-w-xl font-aboreto text-3xl font-bold sm:text-4xl">
            Ask me anything
          </h1>
          <div className="mx-auto w-full max-w-6xl">
            <Chat apiPath="chat" />
            <div className="mt-8 flex flex-col items-center justify-center ">
              <Image
                className=" rotate-[180deg]"
                height={150}
                width={250}
                src="/logo-down-pink.svg"
                alt="logo"
              />
            </div>
          </div>
        </main>
      </div>
    </Layout>
  )
}

export default ChatPage
