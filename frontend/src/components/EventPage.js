import React, { useState, useEffect } from 'react';
import api from '../axios';

export default function EventPage() {
  const [title, setTitle] =
