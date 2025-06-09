import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-formulario',
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './formulario.component.html',
  styleUrl: './formulario.component.css'
})
export class FormularioComponent {
  form: FormGroup;
  loading = false;
  result: any = null;
  error: string | null = null;

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.form = this.fb.group({
      suicidalThoughts: ['no', Validators.required],
      financialStress: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
      academicPressure: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
      sleepDuration: ['4_to_6h', Validators.required],
      familyHistory: ['no', Validators.required],
      cgpa: [7.0, [Validators.required, Validators.min(0), Validators.max(10)]],
      studySatisfaction: [2, [Validators.required, Validators.min(1), Validators.max(5)]],
      workStudyHours: ['4_6h', Validators.required],
      dietaryHabits: ['moderate', Validators.required],
      age: [25, [Validators.required, Validators.min(12), Validators.max(100)]]
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = null;
    this.result = null;

    const formData = this.form.value;
    const requestData = {
      thoughts: formData.suicidalThoughts === 'yes' ? 1 : 0,
      financial: formData.financialStress,
      academic: formData.academicPressure,
      sleep: this.mapSleepDuration(formData.sleepDuration),
      family: formData.familyHistory === 'yes' ? 1 : 0,
      cgpa: formData.cgpa,
      satisfaction: formData.studySatisfaction,
      hours: this.mapWorkStudyHours(formData.workStudyHours),
      diet: this.mapDietaryHabits(formData.dietaryHabits),
      age: formData.age
    };

    this.http.post(`${environment.apiUrl}/predict`, requestData).subscribe({
      next: (response) => {
        // Handle successful prediction
        this.result = response;
      },
      error: (err) => {
        // Handle errors (show user-friendly messages)
        this.error = 'Failed to connect to the server. Please try later.';
        console.error('API Error:', err);
      }
    });
  }

  private markAllAsTouched() {
    Object.values(this.form.controls).forEach(control => {
      control.markAsTouched();
    });
  }

  private mapSleepDuration(value: string): number {
    const map: Record<string, number> = {
      'less_than_4h': 0,
      '4_to_6h': 1,
      '6_to_8h': 2,
      'more_than_8h': 3
    };
    return map[value] ?? 1;
  }

  private mapWorkStudyHours(value: string): number {
    const map: Record<string, number> = {
      '0_2h': 0,
      '2_4h': 1,
      '4_6h': 2,
      '6h_or_more': 3
    };
    return map[value] ?? 2;
  }

  private mapDietaryHabits(value: string): string {
    const map: Record<string, string> = {
      'healthy': 'Saudável',
      'moderate': 'Moderado',
      'poor': 'Ruim',
      'unhealthy': 'Não Saudável'
    };
    return map[value] ?? 'Moderado';
  }
}