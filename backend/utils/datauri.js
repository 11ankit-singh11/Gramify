import DataUriParser from 'datauri/parser.js';
import path from 'path';// no need to install, it's a built-in module in Node.js
// This module provides a utility to convert file buffers into data URIs

const parser = new DataUriParser();

const getDataUri = (file) =>{
    const extName = path.extname(file.originalname).toString();
    return parser.format(extName, file.buffer).content;
};
export default getDataUri;
