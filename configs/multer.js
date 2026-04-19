import multer from 'multer';

const stroage=multer.diskStorage({});

const upload=multer({stroage})

export default upload;