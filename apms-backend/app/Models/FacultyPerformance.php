<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FacultyPerformance extends Model
{
    protected $table = 'faculty_performance';

    protected $fillable = [
        'school_id',
        'academic_period_id',
        'total_faculty',
        'full_time',
        'part_time',
        'average_evaluation_score',
        'with_masters',
        'with_doctorate',
        'with_board_license',
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

    public function academicPeriod()
    {
        return $this->belongsTo(AcademicPeriod::class);
    }
}