import React from 'react';
import { Typography, Box } from '@mui/material';

export function Main() {
    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Главная страница
            </Typography>
            <Typography paragraph>
                Добро пожаловать в главный раздел приложения!
            </Typography>
            {/* Добавьте ваш контент здесь */}
        </Box>
    );
}