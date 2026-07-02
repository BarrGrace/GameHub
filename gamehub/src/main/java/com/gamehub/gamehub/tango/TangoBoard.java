package com.gamehub.gamehub.tango;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class TangoBoard {
    private int[][] puzzle;
    private int[][] solution;
    private char[][] hConstraints;
    private char[][] vConstraints;
}