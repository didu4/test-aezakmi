import { useState, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { cardSchema } from "../utils/validation";
import type { CardFormData } from "../utils/validation";

import "../styles/card-form.scss";

interface UploadedImage {
  id: string;
  name: string;
  url: string;
}

const AVAILABLE_TAGS = [
  { name: "Design", bg: "#EEE4FF", color: "#814EE0" },
  { name: "Frontend", bg: "#E7EEFF", color: "#2563EB" },
  { name: "Urgent", bg: "#FFE7E7", color: "#EA3A3A" },
];

const PRIORITY_OPTIONS = [
  { value: "Low", label: "Low", icon: "🟢", bg: "#E0F8E6", color: "#22B14C" },
  {
    value: "Medium",
    label: "Medium",
    icon: "🟡",
    bg: "#FFF0E0",
    color: "#E98D20",
  },
  { value: "High", label: "High", icon: "🔥", bg: "#FFE7E7", color: "#EA3A3A" },
];

const STATUS_OPTIONS = ["To Do", "In Progress", "Done"];
const ASSIGNEE_OPTIONS = ["User 1", "User 2", "User 3"];

const CardFormPage = () => {
  const [savedCard, setSavedCard] = useState<CardFormData | null>(null);
  const [savedTags, setSavedTags] = useState<string[]>([]);
  const [savedImages, setSavedImages] = useState<UploadedImage[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CardFormData>({
    resolver: zodResolver(cardSchema),
    defaultValues: {
      title: savedCard?.title || "",
      description: savedCard?.description || "",
      priority: savedCard?.priority || "",
      status: savedCard?.status || "",
      assignee: savedCard?.assignee || "",
      deadline: savedCard?.deadline || "",
    },
  });

  const onSubmit = async (data: CardFormData) => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    if (!isEditing) {
      alert(`Card created!\n\n${JSON.stringify(data, null, 2)}`);
    }

    setSavedCard(data);
    setSavedTags([...selectedTags]);
    setSavedImages([...uploadedImages]);

    setIsSubmitting(false);
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
    if (savedCard) {
      setValue("title", savedCard.title);
      setValue("description", savedCard.description);
      setValue("priority", savedCard.priority);
      setValue("status", savedCard.status);
      setValue("assignee", savedCard.assignee);
      setValue("deadline", savedCard.deadline);
    }
    setSelectedTags([...savedTags]);
    setUploadedImages([...savedImages]);
  };

  const handleCancel = () => {
    if (savedCard) {
      setSelectedTags([...savedTags]);
      setUploadedImages([...savedImages]);
      setIsEditing(false);
    } else {
      reset();
      setSelectedTags([]);
      setUploadedImages([]);
    }
  };

  const toggleTag = (tagName: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagName)
        ? prev.filter((t) => t !== tagName)
        : [...prev, tagName],
    );
  };

  const handleFileUpload = useCallback((files: FileList | null) => {
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const newImage: UploadedImage = {
            id: Date.now() + Math.random().toString(),
            name: file.name,
            url: e.target?.result as string,
          };
          setUploadedImages((prev) => [...prev, newImage]);
        };
        reader.readAsDataURL(file);
      }
    });
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      handleFileUpload(e.dataTransfer.files);
    },
    [handleFileUpload],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const removeImage = (id: string) => {
    setUploadedImages((prev) => prev.filter((img) => img.id !== id));
  };

  const getPriorityStyle = (priority: string) => {
    const option = PRIORITY_OPTIONS.find((opt) => opt.value === priority);
    return option || PRIORITY_OPTIONS[0];
  };

  if (savedCard && !isEditing) {
    const priorityStyle = getPriorityStyle(savedCard.priority);

    return (
      <div className="card-form-page">
        <h1 className="card-preview-title">Card Preview</h1>

        <div className="card-preview-container">
          <div className="card-preview-badges">
            {savedCard.status && (
              <span className="card-preview-status">{savedCard.status}</span>
            )}
            <span
              className="card-preview-priority"
              style={{
                backgroundColor: priorityStyle.bg,
                color: priorityStyle.color,
                fontFamily: "Inter, sans-serif",
              }}
            >
              {priorityStyle.icon} {priorityStyle.label}
            </span>
          </div>

          <h2 className="card-preview-title-text">{savedCard.title}</h2>

          <p className="card-preview-description">{savedCard.description}</p>

          <div className="card-preview-divider" />

          <div className="card-preview-meta">
            <div>
              <p className="card-preview-meta-label">ASSIGNEE</p>
              <p className="card-preview-meta-value">
                {savedCard.assignee || "Not assigned"}
              </p>
            </div>
            <div>
              <p className="card-preview-meta-label">DEADLINE</p>
              <p className="card-preview-meta-value">
                {savedCard.deadline || "Not set"}
              </p>
            </div>
          </div>

          {savedTags.length > 0 && (
            <div className="card-preview-tags">
              {savedTags.map((tagName) => {
                const tag = AVAILABLE_TAGS.find((t) => t.name === tagName);
                return tag ? (
                  <span
                    key={tag.name}
                    className="card-preview-tag"
                    style={{
                      backgroundColor: tag.bg,
                      color: tag.color,
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    {tag.name}
                  </span>
                ) : null;
              })}
            </div>
          )}

          {savedImages.length > 0 && (
            <div className="card-preview-images">
              {savedImages.map((img) => (
                <div key={img.id} className="card-preview-image">
                  <img src={img.url} alt={img.name} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card-preview-actions">
          <button
            onClick={handleCancel}
            className="card-form-btn card-form-btn--cancel"
          >
            ← Back to Form
          </button>
          <button
            onClick={handleEdit}
            className="card-form-btn card-form-btn--submit"
          >
            Edit Card
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card-form-page">
      <h1 className="card-form-title">
        {isEditing ? "Edit Card" : "Create New Card"}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="card-form-container">
          <div className="card-form-grid">
            {/* Левая колонка */}
            <div className="card-form-column">
              <div className="card-form-field">
                <label
                  className={`card-form-label ${errors.title ? "card-form-label--error" : ""}`}
                >
                  Title{" "}
                  <span
                    className={`card-form-label__required ${errors.title ? "card-form-label__required--error" : ""}`}
                  >
                    *
                  </span>
                </label>
                <input
                  type="text"
                  placeholder="Enter card title"
                  className={`card-form-input ${errors.title ? "card-form-input--error" : ""}`}
                  {...register("title")}
                />
                {errors.title && (
                  <p className="card-form-error">{errors.title.message}</p>
                )}
              </div>

              <div className="card-form-field">
                <label
                  className={`card-form-label ${errors.description ? "card-form-label--error" : ""}`}
                >
                  Description{" "}
                  <span
                    className={`card-form-label__required ${errors.description ? "card-form-label__required--error" : ""}`}
                  >
                    *
                  </span>
                </label>
                <textarea
                  placeholder="Enter detailed description..."
                  className={`card-form-textarea ${errors.description ? "card-form-textarea--error" : ""}`}
                  {...register("description")}
                />
                {errors.description && (
                  <p className="card-form-error">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div className="card-form-field">
                <label
                  className={`card-form-label ${errors.priority ? "card-form-label--error" : ""}`}
                >
                  Priority{" "}
                  <span
                    className={`card-form-label__required ${errors.priority ? "card-form-label__required--error" : ""}`}
                  >
                    *
                  </span>
                </label>
                <div className="card-form-select-wrapper">
                  <select
                    className={`card-form-select ${errors.priority ? "card-form-select--error" : ""}`}
                    {...register("priority")}
                  >
                    <option value="">Select priority</option>
                    {PRIORITY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.icon} {option.label}
                      </option>
                    ))}
                  </select>
                  <span className="card-form-select-arrow">▼</span>
                </div>
                {errors.priority && (
                  <p className="card-form-error">{errors.priority.message}</p>
                )}
              </div>

              <div className="card-form-field">
                <label className="card-form-label">Status</label>
                <div className="card-form-select-wrapper">
                  <select className="card-form-select" {...register("status")}>
                    <option value="">Select status</option>
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <span className="card-form-select-arrow">▼</span>
                </div>
              </div>
            </div>

            {/* Правая колонка */}
            <div className="card-form-column">
              <div className="card-form-field">
                <label className="card-form-label">Assignee</label>
                <div className="card-form-select-wrapper">
                  <select
                    className="card-form-select"
                    {...register("assignee")}
                  >
                    <option value="">Select assignee</option>
                    {ASSIGNEE_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <span className="card-form-select-arrow">▼</span>
                </div>
              </div>

              <div className="card-form-field">
                <label className="card-form-label">Deadline</label>
                <div className="card-form-select-wrapper">
                  <input
                    type="date"
                    className="card-form-input"
                    {...register("deadline")}
                  />
                  <span className="card-form-date-icon">📅</span>
                </div>
              </div>

              <div className="card-form-field">
                <label className="card-form-label">Tags</label>
                <div className="card-form-tags">
                  {AVAILABLE_TAGS.map((tag) => (
                    <button
                      key={tag.name}
                      type="button"
                      onClick={() => toggleTag(tag.name)}
                      className={`card-form-tag ${
                        selectedTags.includes(tag.name)
                          ? "card-form-tag--selected"
                          : "card-form-tag--unselected"
                      }`}
                      style={
                        selectedTags.includes(tag.name)
                          ? { backgroundColor: tag.bg, color: tag.color }
                          : {}
                      }
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="card-form-field">
                <label className="card-form-label">
                  Images ({uploadedImages.length})
                </label>

                {uploadedImages.length > 0 ? (
                  <div className="card-form-uploaded">
                    {uploadedImages.map((img) => (
                      <div key={img.id} className="card-form-image-item">
                        <div className="card-form-image-preview">
                          <img src={img.url} alt={img.name} />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeImage(img.id)}
                          className="card-form-image-remove"
                        >
                          🗑
                        </button>
                        <p className="card-form-image-name">{img.name}</p>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="card-form-add-image"
                    >
                      +
                    </button>
                  </div>
                ) : (
                  <div
                    className={`card-form-dropzone ${isDragOver ? "card-form-dropzone--dragover" : ""}`}
                    onClick={() => fileInputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                  >
                    <span className="card-form-dropzone-icon">☁️</span>
                    <p className="card-form-dropzone-text">
                      Drag & drop images here
                    </p>
                    <p className="card-form-dropzone-browse">
                      or click to browse
                    </p>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="card-form-hidden-input"
                  onChange={(e) => handleFileUpload(e.target.files)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="card-form-actions">
          <button
            type="button"
            onClick={handleCancel}
            className="card-form-btn card-form-btn--cancel"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="card-form-btn card-form-btn--submit"
          >
            {isSubmitting
              ? "Saving..."
              : isEditing
                ? "Save Card"
                : "Create Card"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CardFormPage;
