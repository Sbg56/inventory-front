
import { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from "@mui/material";
import {useCategories} from "../../entities/category/model/useCategories";
import type {CategoryRequest} from "../../shared/types/categoryTypes";


interface CreateCategoryModalProps {
    open: boolean;
    onClose: () => void;
}

export default function CreateCategoryModal({ open, onClose }: CreateCategoryModalProps) {
    const { useCreateCategory } = useCategories();
    const createCategoryMutation = useCreateCategory();

    const [formData, setFormData] = useState<CategoryRequest>({
        name: "",
        description: ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createCategoryMutation.mutate(formData, {
            onSuccess: () => {
                setFormData({ name: "", description: "" });
                onClose(); // Закрываем при успехе
            }
        });
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle sx={{ color: '#A04E2B', fontWeight: 'bold' }}>
                Создание новой категории
            </DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                    <TextField
                        label="Название категории"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        fullWidth
                        required
                    />
                    <TextField
                        label="Описание категории"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        fullWidth
                        multiline
                        rows={3}
                    />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={onClose} color="inherit">Отмена</Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={createCategoryMutation.isPending}
                        sx={{
                            backgroundColor: '#CB673C',
                            '&:hover': { backgroundColor: '#A04E2B' }
                        }}
                    >
                        {createCategoryMutation.isPending ? "Создание..." : "Создать"}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}