import type {MRT_TableInstance} from "material-react-table";
import {Button} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

interface AddButtonProps<TData extends Record<string, unknown>> {
    table: MRT_TableInstance<TData>;
    title: string;
}

export function AddButton<TData extends Record<string, unknown>>({
                                                                     table,
                                                                     title,
                                                                 }: AddButtonProps<TData>) {
    return (
        <Button onClick={() => {
            table.setCreatingRow(true)
        }}
                variant={"contained"} startIcon={<AddIcon/>}
        > {title} </Button>
    )
}