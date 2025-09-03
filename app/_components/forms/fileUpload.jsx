"use client";

// base imports
import { useEffect, useState } from "react";

// chakra imports
import { Box, FileUpload, Flex, Progress } from "@chakra-ui/react";

// icons
import Upload from "@/app/_icons/upload";

export const FileUploader = (props) => {
  const { register } = props;
  const [progress, setProgress] = useState(null);
  const [show, setShow] = useState(false);

  const handleFileChange = (e) => {
    console.log(e);
    setShow(true);

    if (e.acceptedFiles.length) {
      setProgress(100);
    } else if (e.rejectedFiles.length) {
      alert("The file was not accepted. Please try a different file.");
    } else {
      setProgress(null);
      setShow(false);
    }
  };

  useEffect(() => {}, [progress, show]);

  return (
    <FileUpload.Root
      accept={["text/csv"]}
      maxFiles={1}
      onFileChange={handleFileChange}
    >
      {show ? (
        <Progress.Root size="xl" value={progress} width={200}>
          <Progress.Label mb="2">
            {progress == 100 ? "Upload complete." : "Uploading..."}
          </Progress.Label>
          <Progress.Track>
            <Progress.Range />
          </Progress.Track>
          <Progress.Label />
          <Progress.ValueText />
        </Progress.Root>
      ) : null}
      <FileUpload.ItemGroup>
        <FileUpload.Context>
          {({ acceptedFiles }) =>
            acceptedFiles.map((file) => (
              <FileUpload.Item
                key={file.name}
                file={file}
                display="flex"
                justifyContent="space-between"
              >
                <Flex direction="row" gap={2}>
                  <FileUpload.ItemPreview />
                  <FileUpload.ItemName />
                  {/* <FileUpload.ItemSizeText /> */}
                </Flex>
                <FileUpload.ItemDeleteTrigger />
              </FileUpload.Item>
            ))
          }
        </FileUpload.Context>
      </FileUpload.ItemGroup>
      <FileUpload.HiddenInput {...register} />
      <FileUpload.Dropzone maxWidth={300}>
        <Box width={8}>
          <Upload />
        </Box>
        <FileUpload.DropzoneContent>
          <Box>Drag and drop files or click here to upload</Box>
          <Box color="fg.muted">.csv files only accepted</Box>
        </FileUpload.DropzoneContent>
      </FileUpload.Dropzone>
      <FileUpload.Trigger />
    </FileUpload.Root>
  );
};
