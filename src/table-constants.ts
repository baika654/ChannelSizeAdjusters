export const kTablePadPixels = 10;
export const kTableMarginPixels = 1;
export const kTableCellWidthPix = 70;
export const kTableRowHeightPixels = 26;

export const kRegionTypeHeightPix = 28;
export const kChannelColorSize = 8;
export const kChannelHeaderHeight = kChannelColorSize + 26;
export const kChannelsListHeight = 34 + kChannelHeaderHeight;
export const kRegionColumnHeaderHeightPix =
   kRegionTypeHeightPix + kChannelsListHeight;

export const kTableColumnPad = 25;
export const kTableChannelPad = 10;

export const kScrollbarThickness = 17;

export const kSubjectBlockPadTop = 4;
export const kSubjectBlockPadBottom = 10;
export const kSubjectLeftPadding = 15;
export const kSingleRowInSubjectYOffset = 2;

export const kSubjectBlockNonOverlappingRows = 2;
export const kSubjectBlockTransparentPadding = 2;

export const kGroupSummaryHeight = 27;
export const kGroupSummaryCalcRowHeight = 26;
export const kGroupSummaryRowPadding = 7;
export const kGroupSummaryCalcLeftPadding = kSubjectLeftPadding + 4;

export function getWidthOfAllColumns(columns: number[][]) {
   return (
      columns.reduce((memo, columns) => {
         return (
            memo +
            columns.reduce((memo, column) => {
               return memo + getChannelWidth(column);
            }, 0)
         );
      }, 0) +
      kTableColumnPad -
      kTableChannelPad
   );
}

export function getChannelWidth(numCalculations: number) {
   return getChannelWidthMinusPad(numCalculations) + kTableChannelPad;
}

export function getChannelWidthMinusPad(numCalculations: number) {
   return numCalculations * kTableCellWidthPix;
}

export function anySubjectBlockPad(numRows: number): number {
   return numRows <= 1 ? kSingleRowInSubjectYOffset : 0;
}

export function getSubjectBlockHeight(numRows: number) {
   const rowHeight = numRows * kTableRowHeightPixels;

   const subjectPadding =
      kSubjectBlockPadTop +
      anySubjectBlockPad(numRows) +
      kSubjectBlockPadBottom;

   const transparentBorderPadding =
      (numRows - kSubjectBlockNonOverlappingRows) *
      kSubjectBlockTransparentPadding;

   return rowHeight + subjectPadding + transparentBorderPadding;
}

export function getTotalSubjectsBlockHeight(
   numRows: number,
   numSubjects: number
) {
   const rowHeight = numRows * kTableRowHeightPixels;
   const subjectPadding = kSubjectBlockPadTop + kSubjectBlockPadBottom;
   return rowHeight + subjectPadding * numSubjects + kChannelsListHeight - 1;
}

export function getGroupBlockHeight(
   heightOfSummaryRows: number,
   totalHeightOfSubjectBlocks: number
) {
   return totalHeightOfSubjectBlocks + heightOfSummaryRows;
}

export const kSubjectTitleFontSize = 13;
export const kGroupTitleFontSize = 14;
export const kSubjectNamesPadW = 25;
export const kMaxSubjectNamesWidth = 140;

export const kHighlightPad = 14;