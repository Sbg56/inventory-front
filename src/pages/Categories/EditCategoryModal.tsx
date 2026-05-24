import { useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from "@mui/material";
import { useCategories } from "../../entities/category/model/useCategories";
import type { CategoryRequest, CategoryResponse } from "../../shared/types/categoryTypes";
import * as React from "react";

interface EditCategoryModalProps {
    open: boolean;
    onClose: () => void;
    category: CategoryResponse | null;
}

export default function EditCategoryModal({ open, onClose, category }: EditCategoryModalProps) {
    const { useUpdateCategory } = useCategories();
    const updateCategoryMutation = useUpdateCategory();

    const [formData, setFormData] = useState<CategoryRequest>({
        name: "",
        description: ""
    });

    useEffect(() => {
        if (category) {
            setFormData({
                name: category.name || "",
                description: category.description || ""
            });
        }
    }, [category]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!category) return;

        updateCategoryMutation.mutate({ id: category.id, updates: formData }, {
            onSuccess: () => {
                onClose();
            }
        });
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle sx={{ color: '#A04E2B', fontWeight: 'bold' }}>
                Редактирование категории
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
                        disabled={updateCategoryMutation.isPending}
                        sx={{
                            backgroundColor: '#CB673C',
                            '&:hover': { backgroundColor: '#A04E2B' }
                        }}
                    >
                        {updateCategoryMutation.isPending ? "Сохранение..." : "Сохранить"}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}