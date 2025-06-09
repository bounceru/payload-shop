"use client";
import React from "react";
import ComponentCard from "../../common/ComponentCard";
import PaginationWithTextWithIcon from "../pagination/PaginationWithTextWitIcon";
import PaginationWithText from "./PaginationWithText";
import PaginationWithIcon from "./PaginationWitIcon";

export default function PaginationExample() {
  const handlePageChange = (page: number) => {
    console.log(`Page changed to ${page}`);
    // Here you would typically fetch data for the new page
  };
  return (
    <div className="space-y-5 sm:space-y-6">
      <ComponentCard title="Pagination with Text">
        <PaginationWithText
          totalPages={10}
          initialPage={1}
          onPageChange={handlePageChange}
        />
      </ComponentCard>
      <ComponentCard title="Pagination with Text and Icon">
        <PaginationWithTextWithIcon
          totalPages={10}
          initialPage={1}
          onPageChange={handlePageChange}
        />
      </ComponentCard>
      <ComponentCard title="Pagination with  Icon">
        <PaginationWithIcon
          totalPages={10}
          initialPage={1}
          onPageChange={handlePageChange}
        />
      </ComponentCard>
    </div>
  );
}
