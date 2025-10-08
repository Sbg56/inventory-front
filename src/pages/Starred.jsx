import React from 'react';
import { Typography, Box } from '@mui/material';

export function Starred() {
    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Избранное
            </Typography>
            <Typography paragraph>
                Здесь будет ваш избранный контент...
            </Typography>
        </Box>
    );
}