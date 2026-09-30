<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StudentCase extends Model
{
    protected $fillable = [
        'school_id',
        'program_id',
        'academic_period_id',
        'submitted_by',
        'student_no',
        'student_name',
        'year_level',
        'section',
        'birthdate',
        'case_type',
        'destination',
        'reason',
    ];

    protected function casts(): array
    {
        return [
            'birthdate' => 'date',
        ];
    }

    public function school()
    {
        return $this->belongsTo(School::class);
    }

    public function program()
    {
        return $this->belongsTo(Program::class);
    }

    public function academicPeriod()
    {
        return $this->belongsTo(AcademicPeriod::class);
    }
}
