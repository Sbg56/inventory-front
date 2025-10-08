import React from 'react';
import { Typography, Box } from '@mui/material';

export function Inbox() {
    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Входящие
            </Typography>
            <Typography paragraph>
                Здесь будут ваши входящие сообщения...
            </Typography>
        </Box>
    );
}