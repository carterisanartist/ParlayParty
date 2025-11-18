import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Pencil, Check, Trash2, GripVertical } from "lucide-react";
import { useDrag, useDrop } from "react-dnd";

export interface VideoQueueItem {
  id: string;
  url: string;
  title?: string;
  addedBy: string;
  order: number;
  thumbnail?: string;
}

interface VideoFileCardProps {
  video: VideoQueueItem;
  index: number;
  onRename: (id: string, newTitle: string) => void;
  onDelete: (id: string) => void;
  onMove: (dragIndex: number, hoverIndex: number) => void;
}

const ITEM_TYPE = "VIDEO_CARD";

export function VideoFileCard({
  video,
  index,
  onRename,
  onDelete,
  onMove,
}: VideoFileCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(video.title || "");
  const [showCheckmark, setShowCheckmark] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const [{ isDragging }, drag, preview] = useDrag({
    type: ITEM_TYPE,
    item: { id: video.id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver }, drop] = useDrop({
    accept: ITEM_TYPE,
    hover: (item: { id: string; index: number }) => {
      if (item.index !== index) {
        onMove(item.index, index);
        item.index = index;
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSaveRename = () => {
    if (editedTitle.trim() && editedTitle !== video.title) {
      onRename(video.id, editedTitle.trim());
      setShowCheckmark(true);
      setTimeout(() => setShowCheckmark(false), 500);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveRename();
    } else if (e.key === "Escape") {
      setEditedTitle(video.title || "");
      setIsEditing(false);
    }
  };

  return (
    <motion.div
      ref={(node) => drag(drop(node))}
      className="video-file-card group"
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{
        opacity: isDragging ? 0.5 : 1,
        y: 0,
        scale: 1,
        boxShadow: isOver
          ? "0 0 30px rgba(0, 255, 255, 0.4)"
          : isDragging
          ? "0 8px 40px rgba(0, 255, 255, 0.3)"
          : "0 0 0 rgba(0, 255, 255, 0)",
      }}
      exit={{
        opacity: 0,
        x: 30,
        scale: 0.9,
        transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
      }}
      transition={{
        duration: 0.3,
        type: "spring",
        stiffness: 200,
        damping: 20,
      }}
      whileHover={!isDragging ? { scale: 1.02 } : {}}
      layout
      style={{ cursor: isDragging ? "grabbing" : "grab" }}
    >
      {/* Drag Handle */}
      <div className="drag-handle">
        <GripVertical className="w-4 h-4 text-white/30 group-hover:text-white/50 transition-colors" />
      </div>

      {/* Thumbnail */}
      {video.thumbnail && (
        <div className="video-file-thumbnail">
          <img src={video.thumbnail} alt="" className="w-full h-full object-cover" />
        </div>
      )}

      {/* Title Section */}
      <div className="flex-1 min-w-0 relative">
        <AnimatePresence mode="wait">
          {isEditing ? (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              transition={{ duration: 0.2 }}
              className="rename-input-wrapper"
            >
              <input
                ref={inputRef}
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleSaveRename}
                className="rename-input"
                style={{ fontFamily: "Rubik, sans-serif" }}
              />
            </motion.div>
          ) : (
            <motion.div
              key="text"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2"
            >
              <p
                className="text-xs truncate text-[#e6e6f0]"
                style={{
                  fontFamily: "Rubik, sans-serif",
                  fontWeight: 500,
                }}
              >
                {video.title}
              </p>
              <AnimatePresence>
                {showCheckmark && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
                  >
                    <Check className="w-3.5 h-3.5 text-[#00FF88]" style={{ filter: "drop-shadow(0 0 6px rgba(0, 255, 136, 0.8))" }} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        <p
          className="text-xs text-white/40 mt-0.5"
          style={{
            fontFamily: "Rubik, sans-serif",
          }}
        >
          by {video.addedBy}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        {/* Rename Button */}
        <motion.button
          onClick={() => setIsEditing(true)}
          className="rename-button opacity-0 group-hover:opacity-100"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          title="Rename"
        >
          <Pencil className="w-3.5 h-3.5" />
        </motion.button>

        {/* Delete Button */}
        <motion.button
          onClick={() => onDelete(video.id)}
          className="delete-button-enhanced opacity-0 group-hover:opacity-100"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          title="Delete"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </motion.button>
      </div>

      <style>{`
        .video-file-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: visible;
        }

        .video-file-card:hover {
          background: rgba(255, 45, 179, 0.08);
          border-color: rgba(255, 45, 179, 0.3);
          box-shadow: 0 0 20px rgba(255, 45, 179, 0.2);
        }

        .drag-handle {
          cursor: grab;
          padding: 4px;
          flex-shrink: 0;
        }

        .video-file-thumbnail {
          width: 64px;
          height: 48px;
          border-radius: 8px;
          overflow: hidden;
          flex-shrink: 0;
          border: 1px solid rgba(255, 45, 179, 0.3);
          box-shadow: 0 0 12px rgba(255, 45, 179, 0.25);
          transition: all 0.3s ease;
        }

        .video-file-card:hover .video-file-thumbnail {
          border-color: rgba(255, 45, 179, 0.5);
          box-shadow: 0 0 18px rgba(255, 45, 179, 0.4);
        }

        .rename-input-wrapper {
          position: relative;
        }

        .rename-input {
          width: 100%;
          background: rgba(0, 255, 255, 0.08);
          border: 1px solid rgba(0, 255, 255, 0.5);
          color: #e6e6f0;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 12px;
          outline: none;
          box-shadow: 
            0 0 15px rgba(0, 255, 255, 0.3),
            inset 0 0 10px rgba(0, 255, 255, 0.1);
          transition: all 0.2s ease;
        }

        .rename-input:focus {
          background: rgba(0, 255, 255, 0.12);
          border-color: rgba(0, 255, 255, 0.7);
          box-shadow: 
            0 0 20px rgba(0, 255, 255, 0.5),
            inset 0 0 15px rgba(0, 255, 255, 0.15);
        }

        .rename-button {
          padding: 6px;
          background: rgba(0, 255, 255, 0.1);
          border: 1px solid rgba(0, 255, 255, 0.3);
          border-radius: 6px;
          color: #00FFFF;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .rename-button:hover {
          background: rgba(0, 255, 255, 0.2);
          border-color: rgba(0, 255, 255, 0.6);
          box-shadow: 0 0 15px rgba(0, 255, 255, 0.4);
        }

        .delete-button-enhanced {
          padding: 6px;
          background: rgba(255, 0, 0, 0.1);
          border: 1px solid rgba(255, 0, 0, 0.3);
          border-radius: 6px;
          color: #ff4444;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .delete-button-enhanced:hover {
          background: rgba(255, 0, 0, 0.25);
          border-color: rgba(255, 0, 0, 0.6);
          box-shadow: 0 0 18px rgba(255, 0, 0, 0.5);
        }
      `}</style>
    </motion.div>
  );
}
