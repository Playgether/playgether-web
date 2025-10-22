"use client";

import React, { ButtonHTMLAttributes, useState } from "react";
import { Button } from "@/components/ui/button";
import { twMerge, twJoin } from "tailwind-merge";
import { Heart } from "lucide-react";
import { postLike } from "../../../../../services/postLike";
import { deleteLike } from "../../../../../services/deleteLike";

export interface PropertiersLikeProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  quantity_likes: number;
  iconClassName?: string;
  user_already_like: boolean;
  content_type: string;
  object_id: number;
  onAddLike?: () => void;
  onDeleteLike?: () => void;
}

const PropertiersLike = ({
  quantity_likes,
  iconClassName,
  user_already_like,
  content_type,
  object_id,
  onAddLike,
  onDeleteLike,
  ...rest
}: PropertiersLikeProps) => {
  const [onClicked, setOnClicked] = useState(user_already_like);
  const [quantitylikesNumber, setQuantityLikesNumber] =
    useState(quantity_likes);

  const onClickLike = async () => {
    const data = {
      content_type,
      object_id,
    };

    // Otimista UI update
    setOnClicked(true);
    setQuantityLikesNumber((prev) => prev + 1);

    try {
      await postLike(data);
      onAddLike?.();
    } catch (error) {
      console.error("Erro ao curtir:", error);

      setOnClicked(false);
      setQuantityLikesNumber((prev) => prev - 1);
    }
  };

  const onClickDeleteLike = async () => {
    setOnClicked(false);
    setQuantityLikesNumber((prev) => prev - 1);

    try {
      await deleteLike(object_id);
      onDeleteLike?.();
    } catch (error) {
      console.error("Erro ao curtir:", error);

      setOnClicked(false);
      setQuantityLikesNumber((prev) => prev - 1);
    }
  };

  function formatNumber(number: number) {
    if (number >= 1000000) {
      const formatted = (Math.floor(number / 100000) / 10)
        .toFixed(1)
        .replace(".", ",");
      return formatted.endsWith(",0")
        ? formatted.slice(0, -2) + "mi"
        : formatted + "mi";
    } else if (number >= 1000) {
      const formatted = (Math.floor(number / 100) / 10)
        .toFixed(1)
        .replace(".", ",");
      return formatted.endsWith(",0")
        ? formatted.slice(0, -2) + "mil"
        : formatted + "mil";
    } else {
      return number;
    }
  }

  const handleLike = (e: React.MouseEvent<HTMLButtonElement>) => {
    // prevenir navegação em links pai e evitar propagação
    e.preventDefault();
    e.stopPropagation();

    if (onClicked || user_already_like) onClickDeleteLike();
    else onClickLike();
  };

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={handleLike}
        className={twJoin(
          onClicked ? "text-red-500" : "text-muted-foreground",
          "hover:text-red-500 p-2 hover:bg-accent/50 space-x-2",
          rest.className
        )}
      >
        <Heart
          className={twMerge(
            "w-5 h-5",
            onClicked ? "fill-current" : "",
            iconClassName
          )}
        />
        <p className="PropertiersLike-number">
          {formatNumber(quantitylikesNumber)}
        </p>
      </Button>
    </>
  );
};

export default PropertiersLike;
