const express = require("express")
const multer = require('multer')
const { DocumentProcessorServiceClient } = require('@google-cloud/documentai')

const app = express()
const port = process.env.PORT || 8080

const upload = multer({ storage: multer.memoryStorage() })

const client = new DocumentProcessorServiceClient();

app.get("/", (req, res) => {
    res.json({
        message: "Hello, World!"
    })
})

app.post('/ocr', upload.single('file'), async (req, res) => {

    if (!req.file) {
        return res.status(400).send('No file uploaded.')
    }

    const projectId = process.env.GCP_PROJECT_ID
    const location = process.env.GCP_LOCATION
    const processorId = process.env.GCP_PROCESSOR_ID

    const name = `projects/${projectId}/locations/${location}/processors/${processorId}`

    const request = {
        skipHumanReview: true,
        rawDocument: {
            mimeType: "application/pdf",
            content: req.file.buffer.toString('base64')
        }
    }

    try {
        const [result] = await client.processDocument(request)
        const { document } = result

        res.json({
            text: document.text,
            document: document,
        })
    } catch (error) {
        console.error(error)
        res.status(500).send('Error processing document.')
    }
})

app.listen(port, () => {
    console.log(`Server has successfully started on port ${port}.`)
})