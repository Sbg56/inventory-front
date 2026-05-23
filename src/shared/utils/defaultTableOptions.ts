import {type MRT_RowData, type MRT_TableOptions} from 'material-react-table';
import {MRT_Localization_RU} from "material-react-table/locales/ru";

export const getDefaultMRTOptions = <TData extends MRT_RowData>(): Partial<
    MRT_TableOptions<TData>
> => ({
    localization: MRT_Localization_RU,
    enableGlobalFilterModes: true,
    enableRowNumbers: true,

    rowNumberDisplayMode: "static",
    initialState: {
        density: 'compact',
        showGlobalFilter: true,
        columnPinning: {
            right: ['mrt-row-actions']
        }
    },
    enableStickyHeader: true,
    createDisplayMode: "modal",
    editDisplayMode: "modal",
    enableRowActions: true,
    enableColumnPinning: true,
    muiTableHeadCellProps: {
        sx: {
            fontSize: '1rem'
        },
    },
    paginationDisplayMode: 'pages',
    positionGlobalFilter: 'right',
    muiSearchTextFieldProps: {
        placeholder: 'Поиск...',
        variant: 'outlined',
    },
    muiTablePaperProps: {
        sx: {
            boxShadow: 4,
            borderRadius: 4,

        }


    },
    muiExpandButtonProps: ({ row, table }) => ({
        onClick: () => table.setExpanded({ [row.id]: !row.getIsExpanded() }),
        sx: {
            transform: row.getIsExpanded() ? 'rotate(180deg)' : 'rotate(-90deg)',
            transition: 'transform 0.4s',
        },
    }),


});