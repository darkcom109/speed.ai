import React from "react"

export type RenderPaginationProps = {
    firstVisibleEntry: number
    lastVisibleEntry: number
    totalEntries: number
    currentPage: number
    setCurrentPage: React.Dispatch<React.SetStateAction<number>>
    pageCount: number
}
