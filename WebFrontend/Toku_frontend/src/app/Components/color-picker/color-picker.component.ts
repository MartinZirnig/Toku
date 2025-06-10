import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { ColorPickerModule } from 'ngx-color-picker';
import { FormsModule } from '@angular/forms'; // <-- přidat
import { ColorSettingsModel } from '../../data_managements/models/color-settings-model';
import { ColorManagerService } from '../../services/color-manager.service';
import { ArgbColorModel } from '../../data_managements/models/argb-color-model';
import { NgIf } from '@angular/common';
import { GradientArgbColorModel } from '../../data_managements/models/gradient-argb-color-model';


@Component({
  selector: 'app-color-picker',
  imports: [ColorPickerModule, NgIf, FormsModule],
  templateUrl: './color-picker.component.html',
  styleUrl: './color-picker.component.scss'
})
export class ColorPickerComponent implements OnInit {

  @Input() public ArgbModel?: ArgbColorModel;
  @Input() public GradientArgbModel?: GradientArgbColorModel;

  @Output() argbChange = new EventEmitter<ArgbColorModel>();
  @Output() gradientArgbChange = new EventEmitter<GradientArgbColorModel>();
  @Input() label: string = '';
  @Output() labelChange = new EventEmitter<string>();

  public isGradient: boolean = false;
  public rgbaColors: string[] = [];
  public rgbaColor: string = 'undefined';
  public ColorManagerService: ColorManagerService;
  public gradientString: string = '';

  constructor(private colorManager: ColorManagerService)
  {
    this.ColorManagerService = colorManager;
    // Odstraňte zde veškerou logiku pro ArgbModel/GradientArgbModel
  }

  ngOnInit() {
    if (this.ArgbModel !== undefined) {
      this.rgbaColor = this.ArgbModel.toRgbaString();
    }
    if (this.GradientArgbModel !== undefined) {
      this.isGradient = true;
      this.rgbaColors = [
        `rgba(${this.GradientArgbModel.r1},${this.GradientArgbModel.g1},${this.GradientArgbModel.b1},${this.GradientArgbModel.a1 / 255})`,
        `rgba(${this.GradientArgbModel.r2},${this.GradientArgbModel.g2},${this.GradientArgbModel.b2},${this.GradientArgbModel.a2 / 255})`,
        `rgba(${this.GradientArgbModel.r3},${this.GradientArgbModel.g3},${this.GradientArgbModel.b3},${this.GradientArgbModel.a3 / 255})`,
        `rgba(${this.GradientArgbModel.r4},${this.GradientArgbModel.g4},${this.GradientArgbModel.b4},${this.GradientArgbModel.a4 / 255})`,
        `rgba(${this.GradientArgbModel.r5},${this.GradientArgbModel.g5},${this.GradientArgbModel.b5},${this.GradientArgbModel.a5 / 255})`,
        `rgba(${this.GradientArgbModel.r6},${this.GradientArgbModel.g6},${this.GradientArgbModel.b6},${this.GradientArgbModel.a6 / 255})`
      ];
      this.updateGradientString();
    } else {
      this.rgbaColors = [];
    }
  }

  updateGradientString() {
    // Aktualizace GradientArgbModel podle rgbaColors
    if (this.GradientArgbModel) {
      for (let i = 0; i < 6; i++) {
        const rgba = this.rgbaColors[i];
        const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+),?\s*([\d\.]+)?\)/);
        if (match) {
          const r = parseInt(match[1]);
          const g = parseInt(match[2]);
          const b = parseInt(match[3]);
          const a = match[4] !== undefined ? Math.round(parseFloat(match[4]) * 255) : 255;
          (this.GradientArgbModel as any)[`r${i+1}`] = r;
          (this.GradientArgbModel as any)[`g${i+1}`] = g;
          (this.GradientArgbModel as any)[`b${i+1}`] = b;
          (this.GradientArgbModel as any)[`a${i+1}`] = a;
        }
      }
      this.gradientArgbChange.emit(this.GradientArgbModel);
    }
    const stops = this.rgbaColors.map((color, i) => `${color} ${i * 20}%`);
    this.gradientString = `linear-gradient(90deg, ${stops.join(', ')})`;
  }

  getHexColor(index: number): string {
    // Convert rgba to hex for input[type=color]
    const rgba = this.rgbaColors[index];
    if (!rgba) return '#000000';
    const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (!match) return '#000000';
    const r = parseInt(match[1]).toString(16).padStart(2, '0');
    const g = parseInt(match[2]).toString(16).padStart(2, '0');
    const b = parseInt(match[3]).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
  }

  onColorInput(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    const hex = input.value;
    // Convert hex to rgba, keep alpha as 1
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    this.rgbaColors[index] = `rgba(${r},${g},${b},1)`;
    this.updateGradientString();
  }

  // Pro jednoduchou barvu emituj změnu při změně rgbaColor
  onSingleColorChange() {
    if (this.ArgbModel && this.rgbaColor) {
      const match = this.rgbaColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+),?\s*([\d\.]+)?\)/);
      if (match) {
        this.ArgbModel.r = parseInt(match[1]);
        this.ArgbModel.g = parseInt(match[2]);
        this.ArgbModel.b = parseInt(match[3]);
        this.ArgbModel.a = match[4] !== undefined ? Math.round(parseFloat(match[4]) * 255) : 255;
        this.argbChange.emit(this.ArgbModel);
      }
    }
  }
}
