<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StudentPerformance extends Model
{
    protected $table = 'student_performance';

    protected $fillable = [
        'school_id',
        'program_id',
        'academic_period_id',
        'submitted_by',
        'total_students',
        'passing',
        'failing',
        'incomplete',
        'dropped',
        'passing_rate',
        'average_gwa',
        'latin_honors',
        'notes',
        'status',
        'rejection_reason',
        'submitted_by',
        'approved_by',
        'approved_at',
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