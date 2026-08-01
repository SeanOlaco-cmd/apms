<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ClassMonitoring extends Model
{
    protected $fillable = [
        'school_id',
        'program_id',
        'academic_period_id',
        'submitted_by',
        'subject_name',
        'subject_code',
        'instructor_name',
        'total_students',
        'passing',
        'failing',
        'incomplete',
        'dropped',
        'passing_rate',
        'status',
        'notes',
    ];

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