<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BoardExamResult extends Model
{
    protected $fillable = [
        'school_id',
        'program_id',
        'academic_period_id',
        'submitted_by',
        'total_examinees',
        'total_passers',
        'passing_rate',
        'first_timers',
        'first_timer_passers',
        'first_timer_passing_rate',
        'exam_name',
        'exam_date',
        'status',
        'notes',
        'rejection_reason',
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