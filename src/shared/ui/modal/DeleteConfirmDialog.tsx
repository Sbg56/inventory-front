import {Button, Dialog, DialogActions, DialogContent, DialogTitle} from "@mui/material";

interface DeleteConfirmDialogProps {
    open: boolean;
    title?: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function DeleteConfirmDialog(props: DeleteConfirmDialogProps) {
    return (
        <Dialog open={props.open} onClose={props.onCancel}>
            <DialogTitle>{props.title}</DialogTitle>
            <DialogContent>
                {props.message}
            </DialogContent>
            <DialogActions>
                <Button onClick={props.onCancel} color={"primary"}>Отмена</Button>
                <Button variant={"contained"} onClick={props.onConfirm} color={"error"}>Удалить</Button>
            </DialogActions>
        </Dialog>
    )
}