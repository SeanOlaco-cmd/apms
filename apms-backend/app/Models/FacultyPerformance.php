<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FacultyPerformance extends Model
{
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