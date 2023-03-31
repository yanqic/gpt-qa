import type { NextApiRequest } from "next"
import formidable from "formidable"
import pdfParse from "pdf-parse"
import { Writable } from "stream"

const formidableConfig = {
  keepExtensions: true,
  maxFileSize: 20_000_000,
  maxFieldsSize: 30_000_000,
  maxFields: 7,
  allowEmptyFiles: false,
  multiples: false,
}

export const getTextContentFromPDF = async (pdfBuffer) => {
  // TODO: pass metadata
  const { text } = await pdfParse(pdfBuffer)
  return text
}

export const formidablePromise = (
  req: NextApiRequest,
  opts?: Parameters<typeof formidable>[0]
): Promise<{ fields: formidable.Fields; files: formidable.Files }> => {
  return new Promise((accept, reject) => {
    const form = formidable(opts)

    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err)
      }
      return accept({ fields, files })
    })
  })
}

export const fileConsumer = <T = unknown>(acc: T[]) => {
  const writable = new Writable({
    write: (chunk, _enc, next) => {
      acc.push(chunk)
      next()
    },
  })

  return writable
}

const convertFileToString = async (file: formidable.File, chunks) => {
  const fileData = Buffer.concat(chunks)

  let fileText = ""

  switch (file.mimetype) {
    case "text/plain":
      fileText = fileData.toString()
      break
    case "application/pdf":
      fileText = await getTextContentFromPDF(fileData)
      break
    case "application/json":
      fileText = await fileData.toString()
      break
    case "application/octet-stream":
      fileText = fileData.toString()
      break
    default:
      throw new Error("Unsupported file type.")
  }

  return fileText
}

export const getFileText = async (req: NextApiRequest) => {
  const chunks: never[] = []
  const { fields, files } = await formidablePromise(req, {
    ...formidableConfig,
    // consume this, otherwise formidable tries to save the file to disk
    fileWriteStreamHandler: () => fileConsumer(chunks),
  })

  const { file } = files

  return convertFileToString(file as formidable.File, chunks)
}
