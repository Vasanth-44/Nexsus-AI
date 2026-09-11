"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, FileText, Search, UploadCloud } from "lucide-react";
import { askNexus, uploadDocument } from "@/lib/api";
import type { UploadedDocumentRecord } from "@/lib/types";
import { addUploadedDocument, createId, getThreadId, getUploadedDocuments } from "@/lib/storage";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { MarkdownRenderer } from "@/components/ui/MarkdownRenderer";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { useUserId } from "@/hooks/useUserId";
import { formatFileSize } from "@/lib/utils";

const allowedExtensions = [".pdf", ".txt"];

export function DocumentsClient() {
  const { userId } = useUserId();
  const { showToast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documents, setDocuments] = useState<UploadedDocumentRecord[]>([]);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [answerLoading, setAnswerLoading] = useState(false);
  const [answerError, setAnswerError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setDocuments(getUploadedDocuments(userId));
  }, [userId]);

  const validateFile = (file: File) => {
    const lowerName = file.name.toLowerCase();
    const valid = allowedExtensions.some((extension) => lowerName.endsWith(extension));

    if (!valid) {
      return "Only PDF and TXT files are supported.";
    }

    if (file.size === 0) {
      return "Uploaded file is empty.";
    }

    return null;
  };

  const chooseFile = (file: File | null) => {
    setUploadSuccess(null);
    setUploadError(null);

    if (!file) {
      setSelectedFile(null);
      return;
    }

    const validationError = validateFile(file);
    if (validationError) {
      setSelectedFile(null);
      setUploadError(validationError);
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || uploading) {
      return;
    }

    setUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      const response = await uploadDocument(userId, selectedFile);
      const record: UploadedDocumentRecord = {
        id: createId("document"),
        userId,
        filename: response.filename,
        size: selectedFile.size,
        chunks: response.chunks,
        uploadedAt: new Date().toISOString()
      };

      addUploadedDocument(record);
      setDocuments(getUploadedDocuments(userId));
      setUploadSuccess(`${response.chunks} knowledge chunks created`);
      setSelectedFile(null);
      showToast({
        title: "Uploaded successfully",
        description: `${response.filename} processed into ${response.chunks} chunks.`,
        type: "success"
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Something went wrong. Please check that the NEXUS AI backend is running.";
      setUploadError(message);
      showToast({
        title: "Upload failed",
        description: "Please check the file and backend status.",
        type: "error"
      });
    } finally {
      setUploading(false);
    }
  };

  const askDocuments = async () => {
    const trimmed = question.trim();
    if (!trimmed || answerLoading) {
      return;
    }

    setAnswerLoading(true);
    setAnswerError(null);
    setAnswer("");

    try {
      const response = await askNexus(userId, trimmed, getThreadId());
      setAnswer(response.result);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Something went wrong. Please check that the NEXUS AI backend is running.";
      setAnswerError(message);
      showToast({
        title: "Document question failed",
        description: "Please check that the backend is running.",
        type: "error"
      });
    } finally {
      setAnswerLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24 }}
        className="rounded-lg border border-border/70 bg-panel/[0.68] p-5 backdrop-blur-xl sm:p-6"
      >
        <div className="flex items-start gap-4">
          <div className="grid size-12 shrink-0 place-items-center rounded-lg bg-accent text-accent-foreground">
            <FileText className="size-6" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">Knowledge Base</h2>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Upload resumes, notes, PDFs, and text documents for RAG-backed career and learning support.
            </p>
          </div>
        </div>
      </motion.section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <Card>
          <CardBody>
            <div
              onDragOver={(event) => {
                event.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(event) => {
                event.preventDefault();
                setDragging(false);
                chooseFile(event.dataTransfer.files.item(0));
              }}
              className={`relative overflow-hidden rounded-lg border border-dashed p-8 text-center transition ${
                dragging ? "border-accent bg-accent/[0.10]" : "border-border bg-muted/35"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.txt"
                className="sr-only"
                onChange={(event) => chooseFile(event.target.files?.item(0) ?? null)}
              />
              <div className="mx-auto grid size-14 place-items-center rounded-lg border border-accent/30 bg-accent/[0.12] text-accent">
                <UploadCloud className="size-7" aria-hidden="true" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-foreground">Drop your document here</h3>
              <p className="mt-2 text-sm text-muted-foreground">PDF or TXT</p>
              <Button
                variant="secondary"
                className="mt-5"
                onClick={() => fileInputRef.current?.click()}
                icon={<FileText className="size-4" aria-hidden="true" />}
              >
                Choose File
              </Button>
              {uploading ? (
                <div className="absolute inset-x-0 bottom-0 h-1 overflow-hidden bg-muted">
                  <motion.div
                    className="h-full w-1/3 bg-accent"
                    animate={{ x: ["-120%", "320%"] }}
                    transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
                  />
                </div>
              ) : null}
            </div>

            {selectedFile ? (
              <div className="mt-4 rounded-lg border border-border bg-muted/35 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{selectedFile.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
                  </div>
                  <Button
                    onClick={handleUpload}
                    disabled={uploading}
                    icon={<UploadCloud className="size-4" aria-hidden="true" />}
                  >
                    {uploading ? "Uploading" : "Upload Document"}
                  </Button>
                </div>
              </div>
            ) : null}

            {uploading ? <div className="mt-4"><Spinner label="Processing document" /></div> : null}
            {uploadSuccess ? (
              <div className="mt-4 flex items-center gap-2 rounded-lg border border-success/35 bg-success/[0.12] p-3 text-sm text-success">
                <CheckCircle2 className="size-4" aria-hidden="true" />
                <span>Uploaded successfully · {uploadSuccess}</span>
              </div>
            ) : null}
            {uploadError ? (
              <div className="mt-4 rounded-lg border border-danger/30 bg-danger/[0.08] p-3 text-sm text-danger">
                {uploadError}
              </div>
            ) : null}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="font-semibold text-foreground">Uploaded Documents</h3>
            <p className="mt-1 text-sm text-muted-foreground">Tracked on this device for the current user ID.</p>
          </CardHeader>
          <CardBody>
            {documents.length > 0 ? (
              <div className="space-y-3">
                {documents.map((document) => (
                  <div key={document.id} className="rounded-lg border border-border bg-muted/35 p-3">
                    <div className="flex items-start gap-3">
                      <FileText className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{document.filename}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {formatFileSize(document.size)} · {document.chunks} chunks
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No uploaded documents tracked in this browser.</p>
            )}
          </CardBody>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Search className="size-5 text-accent" aria-hidden="true" />
            <div>
              <h3 className="font-semibold text-foreground">Ask about your documents</h3>
              <p className="text-sm text-muted-foreground">Questions are sent through the NEXUS assistant endpoint.</p>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <form
            className="flex flex-col gap-3 sm:flex-row"
            onSubmit={(event) => {
              event.preventDefault();
              void askDocuments();
            }}
          >
            <label htmlFor="document-question" className="sr-only">
              Ask about your documents
            </label>
            <input
              id="document-question"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="What skills are mentioned in my resume?"
              className="h-11 min-w-0 flex-1 rounded-lg border border-border bg-background/70 px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
            <Button type="submit" disabled={answerLoading || !question.trim()} icon={<Search className="size-4" aria-hidden="true" />}>
              Ask
            </Button>
          </form>

          <div className="mt-5">
            {answerLoading ? (
              <Spinner label="Searching your knowledge base" />
            ) : answerError ? (
              <EmptyState title="Something went wrong." description="Please check that the NEXUS AI backend is running." />
            ) : answer ? (
              <MarkdownRenderer content={answer} />
            ) : null}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
