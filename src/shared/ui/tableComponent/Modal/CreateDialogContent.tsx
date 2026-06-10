import {MRT_EditActionButtons, type MRT_Row, type MRT_TableInstance} from "material-react-table";
import type {ReactNode} from "react";
import {DialogActions, DialogContent, DialogTitle} from "@mui/material";


interface CreateDialogProps<TData extends Record<string, unknown>> {
    table: MRT_TableInstance<TData>;
    row: MRT_Row<TData>;
    internalEditComponents: ReactNode;
    title: string;
}

export function CreateDialogContent<TData extends Record<string, unknown>>({
                                                                           table,
                                                                           row,
                                                                           internalEditComponents,
                                                                           title,
                                                                       }: CreateDialogProps<TData>) {
    return (
        <>
            <DialogTitle variant="h5" component="div">
                {title}
            </DialogTitle>
            <DialogContent
                sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2
            }}>
                {internalEditComponents}
            </DialogContent>
            <DialogActions>
                <MRT_EditActionButtons variant={"text"} row={row} table={table}/>
            </DialogActions>
        </>
    )
}