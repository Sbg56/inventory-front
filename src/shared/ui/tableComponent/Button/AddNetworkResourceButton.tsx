import type {MRT_TableInstance} from "material-react-table";
import {Button} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

interface AddNetworkResourceButtonProps<TData extends Record<string, unknown>> {
    table: MRT_TableInstance<TData>;
    title: string;
}

export function AddNetworkResourceButton<TData extends Record<string, unknown>>({
                                                                                    table,
                                                                                    title,
                                                                                }: AddNetworkResourceButtonProps<TData>) {
    return (
        <Button onClick={() => {
            table.setCreatingRow(true);
        }} variant={"contained"} startIcon={<AddIcon/>}>{title}</Button>
    )
}