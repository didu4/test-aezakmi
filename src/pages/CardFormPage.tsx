// src/pages/CardFormPage.tsx
import { useState, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCard } from "../context/useCard";
import { cardSchema } from "../utils/validation";
import type { CardFormData } from "../utils/validation";
import type { UploadedImage } from "../context/CardContext";

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
  const {
    savedCard,
    setSavedCard,
    savedTags,
    setSavedTags,
    savedImages,
    setSavedImages,
  } = useCard();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>(savedTags);
  const [uploadedImages, setUploadedImages] =
    useState<UploadedImage[]>(savedImages);
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

  const inputStyle = {
    fontFamily: "Inter, sans-serif",
    backgroundColor: "#F2F3F9",
    borderRadius: "14px",
  };

  const labelStyle = {
    fontFamily: "Inter, sans-serif",
    fontWeight: 500,
    fontSize: "13px",
    color: "#18184C",
  };

  const placeholderStyle = {
    fontFamily: "Inter, sans-serif",
    fontWeight: 400,
    fontSize: "14px",
    color: "#8E93A1",
  };

  // Если карточка сохранена и не в режиме редактирования - показываем превью
  if (savedCard && !isEditing) {
    const priorityStyle = getPriorityStyle(savedCard.priority);

    return (
      <div className="p-[24px]">
        <h1
          className="text-[26px] font-bold mb-[24px]"
          style={{
            color: "#18184C",
            fontFamily: "Inter, sans-serif",
            fontWeight: 700,
          }}
        >
          Card Preview
        </h1>

        <div
          className="bg-white rounded-[20px] p-[32px]"
          style={{
            boxShadow:
              "0px 6px 24px 0px rgba(0, 0, 0, 0.06), 0px 2px 6px 0px rgba(0, 0, 0, 0.02)",
          }}
        >
          <div className="flex gap-[8px] mb-[18px]">
            {savedCard.status && (
              <span
                className="px-[10px] py-[5px] rounded-[8px] text-[12px] font-semibold"
                style={{
                  backgroundColor: "#E7EEFF",
                  color: "#2563EB",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                {savedCard.status}
              </span>
            )}
            <span
              className="px-[10px] py-[5px] rounded-[8px] text-[12px] font-semibold"
              style={{
                backgroundColor: priorityStyle.bg,
                color: priorityStyle.color,
                fontFamily: "Inter, sans-serif",
              }}
            >
              {priorityStyle.icon} {priorityStyle.label}
            </span>
          </div>

          <h2
            className="text-[22px] font-bold mb-[8px]"
            style={{ color: "#18184C", fontFamily: "Inter, sans-serif" }}
          >
            {savedCard.title}
          </h2>

          <p
            className="text-[15px] mb-[18px]"
            style={{
              color: "#8E93A1",
              fontFamily: "Inter, sans-serif",
              lineHeight: "22px",
            }}
          >
            {savedCard.description}
          </p>

          <div
            className="w-full h-[1px] mb-[18px]"
            style={{ backgroundColor: "#E6E7ED" }}
          />

          <div className="flex gap-[40px] mb-[18px]">
            <div>
              <p
                className="text-[11px] font-semibold mb-[4px]"
                style={{ color: "#8E93A1", fontFamily: "Inter, sans-serif" }}
              >
                ASSIGNEE
              </p>
              <p
                className="text-[15px] font-semibold"
                style={{ color: "#18184C", fontFamily: "Inter, sans-serif" }}
              >
                {savedCard.assignee || "Not assigned"}
              </p>
            </div>
            <div>
              <p
                className="text-[11px] font-semibold mb-[4px]"
                style={{ color: "#8E93A1", fontFamily: "Inter, sans-serif" }}
              >
                DEADLINE
              </p>
              <p
                className="text-[15px] font-semibold"
                style={{ color: "#18184C", fontFamily: "Inter, sans-serif" }}
              >
                {savedCard.deadline || "Not set"}
              </p>
            </div>
          </div>

          {savedTags.length > 0 && (
            <div className="flex gap-[10px] mb-[18px]">
              {savedTags.map((tagName) => {
                const tag = AVAILABLE_TAGS.find((t) => t.name === tagName);
                return tag ? (
                  <span
                    key={tag.name}
                    className="px-[10px] py-[5px] rounded-[8px] text-[12px] font-semibold"
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
            <div className="flex gap-[10px]">
              {savedImages.map((img) => (
                <div
                  key={img.id}
                  className="w-[90px] h-[60px] rounded-[10px] overflow-hidden"
                  style={{ backgroundColor: "#CFD8E7" }}
                >
                  <img
                    src={img.url}
                    alt={img.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-[12px] mt-[24px]">
          <button
            onClick={handleCancel}
            className="px-[28px] py-[13px] rounded-[14px] transition-all hover:bg-gray-50 cursor-pointer"
            style={{
              border: "1.5px solid #E6E7ED",
              fontFamily: "Inter, sans-serif",
              fontWeight: 600,
              fontSize: "14px",
              color: "#8E93A1",
            }}
          >
            ← Back to Form
          </button>
          <button
            onClick={handleEdit}
            className="px-[28px] py-[13px] rounded-[14px] transition-all hover:opacity-90 active:scale-[0.98] cursor-pointer"
            style={{
              backgroundColor: "#18184C",
              boxShadow: "0px 4px 12px 0px rgba(24, 24, 76, 0.2)",
              fontFamily: "Inter, sans-serif",
              fontWeight: 600,
              fontSize: "14px",
              color: "#FFFFFF",
              border: "none",
            }}
          >
            Edit Card
          </button>
        </div>
      </div>
    );
  }

  // Форма создания/редактирования
  return (
    <div className="p-[24px]">
      <h1
        className="text-[26px] font-bold mb-[24px]"
        style={{
          color: "#18184C",
          fontFamily: "Inter, sans-serif",
          fontWeight: 700,
        }}
      >
        {isEditing ? "Edit Card" : "Create New Card"}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div
          className="bg-white rounded-[20px] p-[28px]"
          style={{ boxShadow: "0px 2px 12px 0px rgba(0, 0, 0, 0.04)" }}
        >
          <div className="grid grid-cols-2 gap-[28px]">
            {/* Левая колонка */}
            <div className="flex flex-col gap-[24px]">
              <div className="flex flex-col gap-[6px]">
                <label style={labelStyle}>
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter card title"
                  className="w-full h-[45px] px-[16px] outline-none transition-all"
                  style={{
                    ...inputStyle,
                    ...placeholderStyle,
                    border: errors.title
                      ? "1.5px solid #EA3A3A"
                      : "1.5px solid transparent",
                    backgroundColor: errors.title ? "#FFF2F2" : "#F2F3F9",
                  }}
                  {...register("title")}
                />
                {errors.title && (
                  <p className="text-sm text-[#EA3A3A]">
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-[6px]">
                <label style={labelStyle}>
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  placeholder="Enter detailed description..."
                  className="w-full h-[110px] px-[16px] py-[12px] outline-none resize-none transition-all"
                  style={{
                    ...inputStyle,
                    ...placeholderStyle,
                    border: errors.description
                      ? "1.5px solid #EA3A3A"
                      : "1.5px solid transparent",
                    backgroundColor: errors.description ? "#FFF2F2" : "#F2F3F9",
                  }}
                  {...register("description")}
                />
                {errors.description && (
                  <p className="text-sm text-[#EA3A3A]">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-[6px]">
                <label style={labelStyle}>
                  Priority <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    className="w-full h-[45px] px-[16px] outline-none appearance-none cursor-pointer transition-all"
                    style={{
                      ...inputStyle,
                      ...placeholderStyle,
                      border: errors.priority
                        ? "1.5px solid #EA3A3A"
                        : "1.5px solid transparent",
                      backgroundColor: errors.priority ? "#FFF2F2" : "#F2F3F9",
                    }}
                    {...register("priority")}
                  >
                    <option value="">Select priority</option>
                    {PRIORITY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.icon} {option.label}
                      </option>
                    ))}
                  </select>
                  <span className="absolute right-[16px] top-1/2 -translate-y-1/2 pointer-events-none text-[#8E93A1]">
                    ▼
                  </span>
                </div>
                {errors.priority && (
                  <p className="text-sm text-[#EA3A3A]">
                    {errors.priority.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-[6px]">
                <label style={labelStyle}>Status</label>
                <div className="relative">
                  <select
                    className="w-full h-[45px] px-[16px] outline-none appearance-none cursor-pointer"
                    style={{
                      ...inputStyle,
                      ...placeholderStyle,
                      border: "1.5px solid transparent",
                    }}
                    {...register("status")}
                  >
                    <option value="">Select status</option>
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <span className="absolute right-[16px] top-1/2 -translate-y-1/2 pointer-events-none text-[#8E93A1]">
                    ▼
                  </span>
                </div>
              </div>
            </div>

            {/* Правая колонка */}
            <div className="flex flex-col gap-[24px]">
              <div className="flex flex-col gap-[6px]">
                <label style={labelStyle}>Assignee</label>
                <div className="relative">
                  <select
                    className="w-full h-[45px] px-[16px] outline-none appearance-none cursor-pointer"
                    style={{
                      ...inputStyle,
                      ...placeholderStyle,
                      border: "1.5px solid transparent",
                    }}
                    {...register("assignee")}
                  >
                    <option value="">Select assignee</option>
                    {ASSIGNEE_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <span className="absolute right-[16px] top-1/2 -translate-y-1/2 pointer-events-none text-[#8E93A1]">
                    ▼
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-[6px]">
                <label style={labelStyle}>Deadline</label>
                <div className="relative">
                  <input
                    type="date"
                    className="w-full h-[45px] px-[16px] outline-none cursor-pointer"
                    style={{
                      ...inputStyle,
                      ...placeholderStyle,
                      border: "1.5px solid transparent",
                    }}
                    {...register("deadline")}
                  />
                  <span className="absolute right-[16px] top-1/2 -translate-y-1/2 pointer-events-none">
                    📅
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-[6px]">
                <label style={labelStyle}>Tags</label>
                <div className="flex gap-[8px] flex-wrap">
                  {AVAILABLE_TAGS.map((tag) => (
                    <button
                      key={tag.name}
                      type="button"
                      onClick={() => toggleTag(tag.name)}
                      className="px-[10px] py-[5px] rounded-[8px] text-[12px] font-semibold transition-all cursor-pointer"
                      style={{
                        backgroundColor: selectedTags.includes(tag.name)
                          ? tag.bg
                          : "#F2F3F9",
                        color: selectedTags.includes(tag.name)
                          ? tag.color
                          : "#8E93A1",
                        fontFamily: "Inter, sans-serif",
                        border: selectedTags.includes(tag.name)
                          ? "1px solid transparent"
                          : "1px solid #E6E7ED",
                      }}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-[6px]">
                <label style={labelStyle}>
                  Images ({uploadedImages.length})
                </label>

                {uploadedImages.length > 0 ? (
                  <div className="flex gap-[10px] flex-wrap">
                    {uploadedImages.map((img) => (
                      <div
                        key={img.id}
                        className="relative w-[195px] h-[90px] rounded-[10px] p-[4px]"
                        style={{ backgroundColor: "#F2F3F9" }}
                      >
                        <div
                          className="w-full h-[64px] rounded-[8px] overflow-hidden"
                          style={{ backgroundColor: "#CFD8E7" }}
                        >
                          <img
                            src={img.url}
                            alt={img.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeImage(img.id)}
                          className="absolute top-[6px] right-[6px] text-[#EA3A3A] hover:text-red-700 cursor-pointer transition-colors"
                          style={{
                            fontSize: "12px",
                            border: "none",
                            backgroundColor: "transparent",
                          }}
                        >
                          🗑
                        </button>
                        <p
                          className="text-[10px] mt-[4px] truncate"
                          style={{
                            color: "#8E93A1",
                            fontFamily: "Inter, sans-serif",
                          }}
                        >
                          {img.name}
                        </p>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-[195px] h-[90px] rounded-[10px] flex items-center justify-center text-[24px] transition-all hover:bg-gray-50 cursor-pointer"
                      style={{ border: "2px dashed #E6E7ED", color: "#8E93A1" }}
                    >
                      +
                    </button>
                  </div>
                ) : (
                  <div
                    className={`w-full h-[120px] rounded-[14px] flex flex-col items-center justify-center gap-[6px] cursor-pointer transition-all ${isDragOver ? "bg-blue-50" : "hover:bg-gray-50"}`}
                    style={{
                      border: isDragOver
                        ? "2px dashed #2563EB"
                        : "2px dashed #E6E7ED",
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                  >
                    <span className="text-[28px]">☁️</span>
                    <p
                      className="text-[13px]"
                      style={{
                        color: "#8E93A1",
                        fontFamily: "Inter, sans-serif",
                      }}
                    >
                      Drag & drop images here
                    </p>
                    <p
                      className="text-[13px] font-semibold"
                      style={{
                        color: "#2563EB",
                        fontFamily: "Inter, sans-serif",
                      }}
                    >
                      or click to browse
                    </p>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFileUpload(e.target.files)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-[12px] mt-[24px]">
          <button
            type="button"
            onClick={handleCancel}
            className="px-[28px] py-[13px] rounded-[14px] transition-all hover:bg-gray-50 cursor-pointer"
            style={{
              border: "1.5px solid #E6E7ED",
              fontFamily: "Inter, sans-serif",
              fontWeight: 600,
              fontSize: "14px",
              color: "#8E93A1",
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-[28px] py-[13px] rounded-[14px] transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            style={{
              backgroundColor: "#18184C",
              boxShadow: "0px 4px 12px 0px rgba(24, 24, 76, 0.2)",
              fontFamily: "Inter, sans-serif",
              fontWeight: 600,
              fontSize: "14px",
              color: "#FFFFFF",
              border: "none",
            }}
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
