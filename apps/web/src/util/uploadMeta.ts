import { NFTStorage } from "nft.storage"
const storage = new NFTStorage({
  token:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweENmRGI3ODU2NEI1NTI5Yzg5NjgwYWEyOUM3OEU4ODg4MTAxQThGZmYiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTcwODY1NDQ1MDc5NSwibmFtZSI6ImFrdmEifQ.5OsnuqiqT7DvS-DoB0Rrv_kKJIpbmLvtv_t8hYvUH38",
})

export const uploadMeta = async ({
  description,
  image,
  name,
}: {
  name: string
  description: string
  image: File
}): Promise<string> => {
  const imageCID = await storage.storeBlob(image)

  const json = {
    name,
    description,
    image: `ipfs://ipfs/${imageCID}`,
  }

  const jsonBlob = JSON.stringify(json)
  return storage.storeBlob(new Blob([jsonBlob], { type: "application/json" }))
}
