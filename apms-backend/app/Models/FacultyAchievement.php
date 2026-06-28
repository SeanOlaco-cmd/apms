<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FacultyAchievement extends Model
{
    protected $fillable = [
        'school_id',
        'academic_period_id',
        'faculty_name',
        'achievement_title',
        'type',
        'date_awarded',
        'awarding_body',
        'description',
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