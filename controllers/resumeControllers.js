import imagekit from "../configs/imagekit.js";
import Resume from "../models/Resume.js";
import fs from 'fs'

//controller for creating  a new resume
//POST: /api/resume/create
export const createResume = async (req, res) => {
    try {
        const userId = req.userId;
        const { title } = req.body;

        //create new resume

        const newResume = await Resume.create({ userId, title })

        //return success
        return res.status(201).json({ message: 'Resume created successfully', resume: newResume })
    } catch (error) {
        return res.status(400).json({ message: error.message })
    }
}

//controller for delete a resume
//DELETE: /api/resume/delete

export const deleteResume = async (req, res) => {
    try {
        const userId = req.userId;
        const { resumeId } = req.params;

        await Resume.findOneAndDelete({ userId, _id: resumeId })


        //return success message
        return res.status(200).json({ message: 'Resume deleted successfully' })
    } catch (error) {
        return res.status(400).json({ message: error.message })
    }
}

//get user resume by id
//GET: /api/resume/get

export const getResumeById = async (req, res) => {
    try {
        const userId = req.userId;
        const { resumeId } = req.params;

        const resume = await Resume.findOne({ userId, _id: resumeId })

        if (!resume) {
            return res.status(404).json({ message: "Resume not found" })
        }
        resume.__v = undefined;
        resume.createdAt = undefined;
        resume.updatedAt = undefined;
        //return success message
        return res.status(200).json({ resume })
    } catch (error) {
        return res.status(400).json({ message: error.message })
    }
}

//return resume data
//GET: /api/resume/public
export const getPublicResumeById = async (req, res) => {
    try {
        const { resumeId } = req.params;
        const resume = await Resume.findOne({ public: true, _id: resumeId })

        if (!resume) {
            return res.status(404).json({ message: "Resume not found.." })
        }
        return res.status(200).json({ resume })
    } catch (error) {

        return res.status(400).json({ message: error.message })
    }
}

//controller for update resume
//PUT: /api/resume/update

export const updateResume = async (req, res) => {
    try {
        const userId = req.userId;
        const { resumeId, resumeData, removeBackground } = req.body;

        // if (!resumeId || !resumeData) {
        //     return res.status(400).json({ message: 'Missing resume update payload' })
        // }

        // if (typeof resumeData === 'string') {
        //     resumeData = JSON.parse(resumeData)
        // }

        // resumeDataCopy.personal_info = resumeDataCopy.personal_info ? { ...resumeDataCopy.personal_info } : {}

        // if (resumeDataCopy.personal_info.image && typeof resumeDataCopy.personal_info.image === 'object' && !req.file) {
        //     delete resumeDataCopy.personal_info.image
        // }

        const image = req.file;
        let resumeDataCopy = JSON.parse(resumeData);
        if (image) {
            const imageBufferData = fs.createReadStream(image.path)
            const response = await imagekit.files.upload({
                file: imageBufferData,
                fileName: 'resume.jpg',
                folder: 'user-resume',
                transformation: {
                    pre: 'w-300,h-300,fo-face,z-0.75' + (removeBackground ? ',e-bgremove' : '')
                }
            });
            resumeDataCopy.personal_info.image = response.url
        }


        const resume = await Resume.findOneAndUpdate(
            { userId, _id: resumeId },
            resumeDataCopy,
            { new: true }
        )

        // if (!resume) {
        //     return res.status(404).json({ message: 'Resume not found' })
        // }

        return res.status(200).json({ message: 'Saved successfully', resume })
    } catch (error) {
        return res.status(400).json({ message: error.message })
    }
}
