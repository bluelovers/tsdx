#!/usr/bin/env node

import 'v8-compile-cache';
import { prog } from './index/sade';

prog.parse(process.argv as any);
