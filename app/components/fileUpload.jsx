// chakra imports
import {
  Box,
  FileUpload,
  Icon,
} from "@chakra-ui/react";

// icons
import { LuUpload } from "react-icons/lu"

export const FileUploader = () => {
  return (
    <FileUpload.Root accept={["text/csv"]}>
      <FileUpload.HiddenInput />
      <FileUpload.Dropzone>
        <Icon size="md" color="fg.muted">
          <LuUpload />
        </Icon>
        <FileUpload.DropzoneContent>
          <Box>Drag and drop files or click here to upload</Box>
          <Box color="fg.muted">.csv only accepted</Box>
        </FileUpload.DropzoneContent>
      </FileUpload.Dropzone>
      <FileUpload.List />
    </FileUpload.Root>
  )
}