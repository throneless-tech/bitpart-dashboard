// chakra imports
import { Box, FileUpload, Icon } from "@chakra-ui/react";

// icons
import Upload from "@/app/_icons/upload";

export const FileUploader = (props) => {
  const { register } = props;

  return (
    <FileUpload.Root accept={["text/csv"]} maxFiles={1}>
      <FileUpload.HiddenInput {...register} />
      <FileUpload.Dropzone>
        <Box width={8}>
          <Upload />
        </Box>
        <FileUpload.DropzoneContent>
          <Box>Drag and drop files or click here to upload</Box>
          <Box color="fg.muted">.csv only accepted</Box>
        </FileUpload.DropzoneContent>
      </FileUpload.Dropzone>
      <FileUpload.Trigger />
      <FileUpload.List />
    </FileUpload.Root>
  );
};
