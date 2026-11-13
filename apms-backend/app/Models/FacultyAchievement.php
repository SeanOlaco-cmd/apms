<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FacultyAchievement extends Model
{
    protected $fillable = [
        'school_id',
        'program_id',
        'academic_period_id',
        'recipient_type',
        'faculty_name',
        'year_level',
        'section',
        'achievement_title',
        'type',
        'date_awarded',
        'awarding_body',
        'description',
        'status',
        'rejection_reason',
        'submitted_by',
        'approved_by',
        'approved_at',
        'rejected_by',
        'vpaa_approved_by',
        'vpaa_approved_at',
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
