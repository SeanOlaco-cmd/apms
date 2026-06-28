<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StudentPerformance extends Model
{
    protected $fillable = [
        'school_id',
        'program_id',
        'academic_period_id',
        'total_students',
        'passing',
        'failing',
        'incomplete',
        'dropped',
        'passing_rate',
        'average_gwa',
        'latin_honors',
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